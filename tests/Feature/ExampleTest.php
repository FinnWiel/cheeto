<?php

namespace Tests\Feature;

// use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_the_interactive_cheeto_page_is_rendered(): void
    {
        $response = $this->get('/');

        $response
            ->assertOk()
            ->assertSee('id="scene"', false)
            ->assertSee('Interactive 3D cheese curl');
    }
}
