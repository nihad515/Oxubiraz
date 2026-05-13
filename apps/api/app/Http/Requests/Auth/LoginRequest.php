<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'login' => ['required', 'string', 'min:3', 'max:100'],
            'password' => ['required', 'string', 'min:8', 'max:128'],
            'remember' => ['sometimes', 'boolean'],
            'device_name' => ['sometimes', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'login.required' => __('validation.required', ['attribute' => 'login']),
            'password.required' => __('validation.required', ['attribute' => 'password']),
        ];
    }
}
