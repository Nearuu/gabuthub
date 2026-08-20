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
        Schema::create('tier_list_likes', function (Blueprint $table) {
            $table->integer('user_id');
            $table->integer('tier_list_id');
            $table->primary(['user_id', 'tier_list_id']);
        });

        Schema::create('ost_likes', function (Blueprint $table) {
            $table->integer('user_id');
            $table->integer('ost_id');
            $table->primary(['user_id', 'ost_id']);
        });

        Schema::create('ost_votes', function (Blueprint $table) {
            $table->integer('user_id');
            $table->integer('ost_id');
            $table->primary(['user_id', 'ost_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tier_list_likes');
        Schema::dropIfExists('ost_likes');
        Schema::dropIfExists('ost_votes');
    }
};
