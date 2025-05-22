# Frontend Readme

This is the frontend application for the Notes project, built with Next.js and React. It provides a user interface to interact with the backend API for managing notes, including a special, persistent "Clipboard" note.

## Features

* **Display Notes**: Fetches and displays all notes from the backend.

* **Add New Note**: Modal form for creating new notes.

* **Edit Existing Notes**: Inline editing for note title, content, and pinned status.

* **Delete Notes**: Confirmation modal for deleting notes.

* **Pin/Unpin Notes**: Toggle a note's pinned status, affecting its display order.

* **Special "Clipboard" Note**:

    * Always displayed at the very top of the list.

    * Has a dedicated "Paste" button to paste content from the system clipboard directly into its content field.

    * Cannot be edited (other than pasting), deleted, or unpinned via the UI.

    * Includes clipboard permission handling and user guidance.

* **Responsive Design**: Adapts to different screen sizes (mobile, tablet, desktop).

* **Error Messages**: Displays user-friendly error messages for API failures or client-side issues.

* **Styling**: Uses CSS Modules for component-scoped styles and global CSS variables for theme consistency.

## Setup

### Prerequisites

* Node.js (LTS version recommended)

* npm or Yarn

* The backend server must be running (typically on `http://localhost:3002`).

### Installation

1.  Navigate to the root of your frontend project.

2.  Install dependencies:

    ```bash
    npm install
    # or
    yarn install
    ```

### Running the Development Server

To start the Next.js development server:

```bash
npm run dev
# or
yarn dev