document.addEventListener("DOMContentLoaded", () => {
  const eventsTab = document.getElementById("events-tab");
  const addEventBtn = document.getElementById("add-event-btn");
  const eventModal = document.getElementById("event-modal");
  const closeModal = eventModal.querySelector(".close");
  const eventForm = document.getElementById("event-form");
  const eventsGrid = document.querySelector(".events-grid");
  const eventSearch = document.querySelector(".event-search");

  const eventTitleInput = document.getElementById("event-title");
  const eventDescInput = document.getElementById("event-description");
  const eventDateInput = document.getElementById("event-date");
  const eventImageInput = document.getElementById("event-image-input");
  let events = []; // This will store our events data
  let editingEventId = null;
  let deleteEventId = null;
  // Fetch events data (replace this with actual API call in production)
  const fetchEvents = async () => {
    const response = await fetch("/events/");

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();

    events = json.events;
    console.log("ALL EVENTS:", events);
    renderEvents();
  };

  eventImageInput.addEventListener("change", (e) => {
    console.log(e.target.value);
  });

  async function addEvent() {
    const formData = new FormData();
    let newImageUrl = "";

    formData.append("event_name", eventTitleInput.value);
    formData.append("event_desc", eventDescInput.value);
    formData.append("event_bucket", "assets/eventImages");
    formData.append("event_date", eventDateInput.value);

    if (eventImageInput.files.length) {
      formData.append("event_image", eventImageInput.files[0]);
      newImageUrl = URL.createObjectURL(eventImageInput.files[0]);
    }

    const response = await fetch("/events/", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();

    const newEvent = json.data;
    newEvent.imageUrl = newImageUrl;
    showSuccessMessage("Successfully added a new event!");
    return newEvent;
  }

  async function updateEvent() {
    const formData = new FormData();
    let newImageUrl = "";

    formData.append("event_name", eventTitleInput.value);
    formData.append("event_desc", eventDescInput.value);
    formData.append("event_bucket", "assets/eventImages");
    formData.append("event_date", eventDateInput.value);

    if (eventImageInput.files.length) {
      formData.append("event_image", eventImageInput.files[0]);
      newImageUrl = URL.createObjectURL(eventImageInput.files[0]);
    }

    const response = await fetch(`/events/${editingEventId}`, {
      method: "PATCH",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();

    const newEvent = json.data;

    if (eventImageInput.files.length) {
      newEvent.imageUrl = newImageUrl;
    }

    showSuccessMessage("Event successfully updated");
    return newEvent;
  }
  async function deleteEvent() {
    const response = await fetch(`/events/${deleteEventId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    deleteEventId = null;
    showErrorMessage("Event deleted!");
    console.log("EVENT SUCCESSFULLY DELETED,", response);
  }

  // Render events in the grid
  const renderEvents = () => {
    eventsGrid.innerHTML = "";
    const filteredEvents = filterEvents(events);
    const sortedEvents = filteredEvents.sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    if (filteredEvents.length === 0) {
      eventsGrid.innerHTML = `
          <div class="no-events-message">
            <div class="no-events-content">
              <h3>No events found</h3>
              <p>Click "Add New Event" to create one.</p>
            </div>
          </div>
        `;
    } else {
      filteredEvents.forEach((event) => {
        const eventElement = createEventElement(event);
        eventsGrid.appendChild(eventElement);
      });
    }
  };

  // Create an event element
  const createEventElement = (event) => {
    const eventElement = document.createElement("div");
    eventElement.classList.add("event-card");
    const date = new Date(event.date);
    const readTime = Math.ceil(event.event_desc.split(" ").length / 200); // Approximate read time

    eventElement.innerHTML = `
        <div class="event-image-container">
          <img src=${event.imageUrl} alt="${
      event.event_name
    }" class="event-image">
        </div>
        <div class="event-details">
          <div class="event-meta">
            <span class="event-date">${date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}</span>
            <span class="event-read-time">${readTime} min read</span>
          </div>
          <h3 class="event-title">${event.event_name}</h3>
          <p class="event-description">${event.event_desc}</p>
          <div class="event-actions">
            <button class="edit-event" data-id="${event.event_id}">Edit</button>
            <button class="delete-event" data-id="${
              event.event_id
            }">Delete</button>
          </div>
        </div>
      `;
    return eventElement;
  };

  // Filter events based on search
  const filterEvents = (eventsToFilter) => {
    const searchTerm = eventSearch.value.toLowerCase();

    return eventsToFilter.filter((event) => {
      const matchesSearch =
        event.event_name.toLowerCase().includes(searchTerm) ||
        event.event_desc.toLowerCase().includes(searchTerm);
      return matchesSearch;
    });
  };

  // Open modal for adding/editing event
  const openModal = (event = null) => {
    const modalTitle = eventModal.querySelector("h3");
    modalTitle.textContent = event ? "Edit Event" : "Add New Event";

    if (event) {
      document.getElementById("event-title").value = event.event_name;
      document.getElementById("event-description").value = event.event_desc;
      document.getElementById("event-date").value = event.date;
      editingEventId = event.event_id;

      console.log("OPENED EVENT:", editingEventId);
    } else {
      editingEventId = null;
    }

    eventModal.style.display = "block";
  };

  // Close modal
  const closeModalHandler = () => {
    eventModal.style.display = "none";
    editingEventId = null;
    eventForm.reset();
  };

  // Event listeners
  addEventBtn?.addEventListener("click", () => openModal());

  closeModal?.addEventListener("click", closeModalHandler);

  eventForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (editingEventId) {
      const newEvent = await updateEvent();
      events = events.map((event) =>
        event.event_id === newEvent.event_id
          ? { ...newEvent, imageUrl: newEvent.imageUrl || event.imageUrl }
          : event
      );
    } else {
      const newEvent = await addEvent();
      events.push(newEvent);
    }
    renderEvents();
    closeModalHandler();
  });

  eventSearch?.addEventListener("input", renderEvents);

  eventsGrid?.addEventListener("click", async (e) => {
    if (e.target.classList.contains("edit-event")) {
      const eventId = parseInt(e.target.dataset.id);
      const eventToEdit = events.find((event) => event.event_id === eventId);
      openModal(eventToEdit);
    } else if (e.target.classList.contains("delete-event")) {
      const eventId = parseInt(e.target.dataset.id);
      deleteEventId = eventId;
      if (confirm("Are you sure you want to delete this event?")) {
        events = events.filter((event) => event.event_id !== eventId);
        console.log("CONFIRMED TO DELETE:", editingEventId);
        deleteEvent();
        renderEvents();
      }
    }
  });

  // Initial fetch and render
  fetchEvents();
});

// Dummy data for events with Unsplash images
const dummyEvents = [
  {
    id: 1,
    title: "Annual Science Fair",
    description:
      "Showcase your innovative projects at our annual science fair. Join us for a day of discovery and creativity!",
    date: "2024-05-15T10:00",
    image:
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "Cultural Festival",
    description:
      "Experience a vibrant celebration of global cultures through traditional performances, cuisine, and interactive workshops.",
    date: "2024-06-22T14:00",
    image:
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Tech Innovation Summit",
    description:
      "Discover the latest technological advances and research projects from our engineering and computer science departments.",
    date: "2024-07-05T09:00",
    image:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop",
  },
  {
    id: 4,
    title: "Alumni Networking Night",
    description:
      "Connect with successful alumni and expand your professional network at this exclusive evening event.",
    date: "2024-08-10T18:00",
    image:
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop",
  },
];
