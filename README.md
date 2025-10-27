# Frontend Readme

This is the frontend application for the Notes project, built with Next.js and React. It provides a user interface to interact with the backend API for managing notes, including a special, persistent "Clipboard" note.

## Features

* **Display Notes**: Fetches and displays all notes from the backend.
  
  <img width="2560" height="1251" alt="Screenshot 2025-09-19 at 17-42-01 Notes" src="https://github.com/user-attachments/assets/a1648bb5-19f8-4c92-98b1-a48a971e87d1" />


* **Add New Note**: Modal form for creating new notes.
  
  <img width="2560" height="1251" alt="Screenshot 2025-09-19 at 17-43-43 Notes" src="https://github.com/user-attachments/assets/a60276c9-80e8-445c-9400-4ab675da25c0" />


* **Edit Existing Notes**: Inline editing for note title, content, and pinned status.
  
  <img width="2560" height="1251" alt="Screenshot 2025-09-19 at 17-53-43 Notes" src="https://github.com/user-attachments/assets/e3677420-345f-4fce-87b7-071859684451" />


* **Delete Notes**: Confirmation modal for deleting notes.
  
   <img width="2560" height="1251" alt="Screenshot 2025-09-19 at 17-47-34 Notes" src="https://github.com/user-attachments/assets/00ab6e3b-fc8a-4ab5-b528-63f8be7626fe" />


* **Pin/Unpin Notes**: Toggle a note's pinned status, affecting its display order.

* **Hidden Notes**: Hide notes behind a pin.

   <img width="2560" height="1251" alt="Screenshot 2025-09-19 at 17-47-47 Notes" src="https://github.com/user-attachments/assets/90410bc9-d462-46de-8131-3c790c995508" />

   <img width="2557" height="1248" alt="Screenshot 2025-09-19 at 17-48-48 Notes" src="https://github.com/user-attachments/assets/24390fe9-d5f0-4d7a-a36a-e3dbd0fe6ed6" />


* **Special "Clipboard" Note**:

    * Always displayed at the very top of the list.

    * Has a dedicated "Paste" button to paste content from the system clipboard directly into its content field.

    * Cannot be edited (other than pasting), deleted, or unpinned via the UI.

    * Includes clipboard permission handling and user guidance.

* **Responsive Design**: Adapts to different screen sizes (mobile, tablet, desktop).

  <img width="482" height="947" alt="Screenshot 2025-09-19 at 17-49-58 Notes" src="https://github.com/user-attachments/assets/47705d76-d4c1-44ef-b458-b736476a4f91" />


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
