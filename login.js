document.getElementById("login-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const credentials = btoa(`${email}:${password}`);

    try {
        console.log("Attempting login...");
        const response = await fetch("https://learn.reboot01.com/api/auth/signin", {
            method: "POST",
            headers: {
                "Authorization": `Basic ${credentials}`,
                "Content-Type": "application/json"
            }
        });

        console.log("Response status:", response.status);
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error("Login failed:", errorData);
            
            // Show animated character with error message for user-related errors
            let errorMessage = "Oops! Something went wrong!";
            if (response.status === 401) {
                errorMessage = "Wrong credentials! Try again!";
                showErrorCharacter(errorMessage);
                return;
            } else if (response.status === 404) {
                errorMessage = "User not found!";
                showErrorCharacter(errorMessage);
                return;
            } else if (response.status >= 500) {
                // For server errors, redirect to 404 page with mini-game
                window.location.replace('404.html');
                return;
            }
            
            // For other errors, show the animated character
            showErrorCharacter(errorMessage);
            return;
        }

        // Get the token directly from the response text
        const token = await response.text();
        console.log("Login successful, storing token...");
        
        if (token) {
            localStorage.setItem("jwt", token);
            window.location.href = "profile.html";
        } else {
            console.error('No token received');
            showErrorCharacter("Invalid server response!");
        }
    } catch (error) {
        console.error("Login error:", error);
        // For network errors, redirect to 404 page with mini-game
        window.location.replace('404.html');
    }
});