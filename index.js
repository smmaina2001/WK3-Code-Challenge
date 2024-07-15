document.addEventListener("DOMContentLoaded", () => {
    // DOM elements
    const movieList = document.getElementById("films");
    const buyTicketButton = document.getElementById("buy-ticket");
    const deleteMovieButton = document.getElementById("delete-movie-button");
    const movieImage = document.getElementById("poster");
    const movieTitle = document.getElementById("title");
    const movieRuntime = document.getElementById("runtime");
    const movieDescription = document.getElementById("film-info");
    const ticketCount = document.getElementById("ticket-num");

    // Variables to store data
    let currentMovie = null; // Store the currently selected movie
    let moviesData = []; // Store the movie data

    // Function to display movie details
    function displayMovieDetails(movie) {
        movieImage.src = movie.poster;
        movieTitle.textContent = movie.title;
        movieRuntime.textContent = `${movie.runtime} minutes`;
        movieDescription.textContent = movie.description;
        ticketCount.textContent = `${movie.capacity - movie.tickets_sold}`;
        document.getElementById("showtime").textContent = movie.showtime;

        // Update the button text based on available tickets
        if (movie.tickets_sold >= movie.capacity) {
            buyTicketButton.textContent = "Sold Out";
            buyTicketButton.setAttribute("disabled", "true");
        } else {
            buyTicketButton.textContent = "Buy Ticket";
            buyTicketButton.removeAttribute("disabled");
        }
    }

    // Function to handle the "Buy Ticket" button click
    function buyTicket(event) {
        event.stopPropagation(); 
            // Check if there are available tickets
            if (currentMovie.tickets_sold < currentMovie.capacity) {
                // Update the sold tickets count
                currentMovie.tickets_sold++;
                updateTicketInfo(currentMovie);
            }
    }

    // Function to handle updating ticket information on the server
    function updateTicketInfo(movie) {
        if (movie) {
            // Send a PUT request to update the server
            fetch(`http://localhost:3000/films/${movie.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(movie),
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Network response was not ok");
                    }
                    return response.json();
                })
                .then((updatedMovie) => {
                    // Update the currentMovie with the updated data
                    currentMovie = updatedMovie;
                    displayMovieDetails(updatedMovie);
                })
                .catch((error) => {
                    console.error("Update error:", error);
                });
        }
    }

    // Function to handle the "Delete Movie" button click
    function deleteCurrentMovie(event) {
        event.stopPropagation(); 
        if (currentMovie) {
            // Send a DELETE request to remove the movie from the server
            fetch(`http://localhost:3000/films/${currentMovie.id}`, {
                method: "DELETE",
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Network response was not ok");
                    }
                    return response.json();
                })
                .then(() => {
                    // Remove the movie from the local data
                    const index = moviesData.findIndex((m) => m.id === currentMovie.id);
                    if (index !== -1) {
                        moviesData.splice(index, 1);
                    }

                    // Clear the currentMovie
                    currentMovie = null;

                    // Clear the movie details
                    movieImage.src = "assets/placeholderImage.png";
                    movieTitle.textContent = "[MOVIE TITLE]";
                    movieRuntime.textContent = "[RUNTIME] minutes";
                    movieDescription.textContent = "[INSERT MOVIE DESCRIPTION HERE]";
                    ticketCount.textContent = "[X]";

                    // Disable the "Buy Ticket" and "Delete Movie" buttons
                    buyTicketButton.setAttribute("disabled", "true");
                    deleteMovieButton.setAttribute("disabled", "true");

                    // Update the movie list
                    updateMovieList();

                    // Display details of the first movie in the updated list
                    if (moviesData.length > 0) {
                        currentMovie = moviesData[0];
                        displayMovieDetails(currentMovie);
                    }
                })
                .catch((error) => {
                    console.error("Delete error:", error);
                });
        }
    }

    // Function to update the movie list
    function updateMovieList() {
        // Clear any existing <li> elements
        movieList.innerHTML = "";

        // Create and populate <li> elements for each movie
        moviesData.forEach((movie) => {
            const li = document.createElement("li");
            li.textContent = movie.title;

            // Add a click event listener to the <li> element
            li.addEventListener("click", () => {
                currentMovie = movie;
                displayMovieDetails(movie);
            });

            // Append the <li> element to the movieList
            movieList.appendChild(li);
        });
    }

    // Make a GET request to the JSON server when the content is loaded
    fetch("http://localhost:3000/films")
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then((data) => {
            // Check if the data is an array of movies
            if (Array.isArray(data)) {
                moviesData = data; // Store the movie data

                // Display the details of the first movie by default if available
                if (data.length > 0) {
                    currentMovie = data[0];
                    displayMovieDetails(currentMovie);
                }

                // Update the movie list
                updateMovieList();

                // Add a click event listener to the "Buy Ticket" button
                buyTicketButton.addEventListener("click", buyTicket);

                // Add a click event listener to the "Delete Movie" button
                deleteMovieButton.addEventListener("click", deleteCurrentMovie);
            } else {
                movieList.innerHTML =
                    "<li>Invalid JSON format. Expected an array of movies.</li>";
            }
        })
        .catch((error) => {
            console.error("Fetch error:", error);
            movieList.innerHTML = "<li>Error fetching data.</li>";
        });
});