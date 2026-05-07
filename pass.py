import re

def check_password_strength(password):
    score = 0
    suggestions = []

    # Length check
    if len(password) >= 8:
        score += 1
    else:
        suggestions.append("Use at least 8 characters")

    # Upper & lower case
    if re.search(r"[A-Z]", password) and re.search(r"[a-z]", password):
        score += 1
    else:
        suggestions.append("Use both uppercase and lowercase letters")

    # Numbers
    if re.search(r"\d", password):
        score += 1
    else:
        suggestions.append("Include numbers")

    # Special characters
    if re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        score += 1
    else:
        suggestions.append("Add special characters")

    # Common patterns
    common = ["123456", "password", "qwerty"]
    if password.lower() in common:
        suggestions.append("Avoid common passwords")
        return "Weak", suggestions

    # Strength rating
    if score <= 2:
        return "Weak", suggestions
    elif score == 3:
        return "Medium", suggestions
    else:
        return "Strong", suggestions


# Test
pwd = input("Enter password: ")
strength, tips = check_password_strength(pwd)

print(f"Strength: {strength}")
print("Suggestions:")
for tip in tips:
    print("-", tip)