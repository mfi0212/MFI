// function setBackgroundBasedOnTime() {
//     const body = document.body;
//     const timeDisplay = document.getElementById('time-display');

//     // Get the current IST time
//     const now = new Date();
//     const istHours = now.getHours();
//     const istMinutes = now.getMinutes();

//     // Determine background color based on the time of day
//     let color = '';
//     let timeOfDay = '';

//     if (istHours >= 5 && istHours < 7) {
//         // Dawn (5 AM to 7 AM)
//         color = '#6A5ACD'; // Slate Blue, darker morning color
//         timeOfDay = 'Dawn';
//     } else if (istHours >= 7 && istHours < 10) {
//         // Morning (7 AM to 10 AM)
//         color = '#4682B4'; // Steel Blue, darker blue for morning
//         timeOfDay = 'Morning';
//     } else if (istHours >= 10 && istHours < 14) {
//         // Midday (10 AM to 2 PM)
//         color = '#4169E1'; // Royal Blue, still bright but darker than noon
//         timeOfDay = 'Midday';
//     } else if (istHours >= 14 && istHours < 17) {
//         // Afternoon (2 PM to 5 PM)
//         color = '#1E90FF'; // Dodger Blue, darker afternoon sky
//         timeOfDay = 'Afternoon';
//     } else if (istHours >= 17 && istHours < 19) {
//         // Evening (5 PM to 7 PM)
//         color = '#FF6347'; // Tomato, darker sunset color
//         timeOfDay = 'Evening';
//     } else if (istHours >= 19 && istHours < 21) {
//         // Dusk (7 PM to 9 PM)
//         color = '#B22222'; // Firebrick, deeper dusk color
//         timeOfDay = 'Dusk';
//     } else {
//         // Night (9 PM to 5 AM)
//         color = 'rgb(0 0 0)'; // Midnight Blue, very dark night sky
//         timeOfDay = 'Night';
//     }

//     // Set the background color and display the current time of day
//     body.style.backgroundColor = color;
//     timeDisplay.textContent = `Time of Day: ${timeOfDay} (Color: ${color}, IST: ${istHours}:${istMinutes < 10 ? '0' + istMinutes : istMinutes})`;
// }

// // Call the function to set the background color
// setBackgroundBasedOnTime();

document.addEventListener("DOMContentLoaded", () => {
    const customMenu = document.querySelector(".custom-menu");

    // Show custom menu on right-click
    document.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        customMenu.style.display = "block";
        customMenu.style.top = `${event.pageY}px`;
        customMenu.style.left = `${event.pageX}px`;
    });

    // Hide the menu when clicking elsewhere
    document.addEventListener("click", () => {
        customMenu.style.display = "none";
    });
});
