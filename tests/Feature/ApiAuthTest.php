<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_via_api(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'API Test User',
            'email' => 'apitest@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'user' => ['id', 'name', 'email', 'status', 'role'],
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'apitest@example.com',
            'status' => 'pending',
            'role' => 'user',
        ]);
    }

    public function test_approved_user_can_login_via_api_and_receive_token(): void
    {
        $user = User::factory()->create([
            'email' => 'approveduser@example.com',
            'password' => bcrypt('password123'),
            'status' => 'approved',
            'role' => 'user',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'approveduser@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'token',
                'user',
            ]);
    }

    public function test_pending_user_cannot_login_via_api(): void
    {
        $user = User::factory()->create([
            'email' => 'pendinguser@example.com',
            'password' => bcrypt('password123'),
            'status' => 'pending',
            'role' => 'user',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'pendinguser@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_authenticated_user_can_get_user_profile_via_api(): void
    {
        $user = User::factory()->create([
            'status' => 'approved',
        ]);

        $token = $user->createToken('test_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/user');

        $response->assertStatus(200)
            ->assertJson([
                'id' => $user->id,
                'email' => $user->email,
            ]);
    }
}
