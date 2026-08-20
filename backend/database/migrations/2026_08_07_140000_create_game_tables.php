<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('game_hot_takes', function (Blueprint $table) {
            $table->id();
            $table->text('text');
            $table->string('category');
        });

        Schema::create('game_characters', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('series');
            $table->text('description');
            $table->text('avatar');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('game_characters');
        Schema::dropIfExists('game_hot_takes');
    }
};
