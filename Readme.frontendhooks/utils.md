
# Utils

The `utils` folder contains small, reusable utility functions used across the GridWaver application.

These functions handle common operations and helper logic so that the same code does not need to be repeated in multiple components.

## Main Responsibilities

* Provides reusable helper functions.
* Simplifies common data-processing tasks.
* Keeps components and hooks clean.
* Improves code reusability and maintainability.
* Separates general-purpose logic from UI code.

## Usage

Utility functions can be imported wherever they are required in the application, including:

* Components
* Hooks
* Services
* Redux logic
* Pages

## Data Flow

```text id="4k2n7p"
Components / Hooks / Services
            ↓
          Utils
            ↓
     Processed Data
            ↓
        Application
```

Keeping helper logic inside the `utils` folder makes the GridWaver codebase more organized, reusable, and easier to maintain.

