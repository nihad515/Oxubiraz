<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;
use App\Enums\UserRole;
use App\Enums\Locale;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $role = $this->input('role');

        return [
            'first_name' => ['required', 'string', 'min:2', 'max:50'],
            'last_name' => ['required', 'string', 'min:2', 'max:50'],
            'username' => ['required', 'string', 'min:3', 'max:30', 'unique:users,username', 'regex:/^[a-z0-9_]+$/'],
            'email' => ['sometimes', 'nullable', 'email', 'max:100', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()],
            'locale' => ['required', 'in:az,ru,en'],
            'role' => ['required', 'in:student,teacher,parent'],

            // Student-specific
            'school_id' => ['required_if:role,student', 'sometimes', 'exists:schools,id'],
            'class_id' => ['required_if:role,student', 'sometimes', 'exists:school_classes,id'],
            'teacher_id' => ['sometimes', 'nullable', 'exists:users,id'],
            'parent_username' => ['sometimes', 'nullable', 'exists:users,username'],

            // Teacher-specific
            'phone' => ['sometimes', 'nullable', 'string', 'min:7', 'max:20'],
            'subject' => ['sometimes', 'nullable', 'string', 'max:100'],
            'experience' => ['sometimes', 'nullable', 'integer', 'min:0', 'max:50'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'username' => strtolower($this->input('username', '')),
        ]);
    }
}
