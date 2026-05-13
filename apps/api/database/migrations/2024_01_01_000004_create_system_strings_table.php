<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('system_strings', function (Blueprint $table) {
            $table->id();
            $table->string('string_key', 100)->unique();
            $table->string('group_name', 50)->default('common');
            $table->text('az');
            $table->text('ru');
            $table->text('en');
            $table->text('description')->nullable();
            $table->timestamps();

            $table->index('group_name');
            $table->index('string_key');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('system_strings');
    }
};
