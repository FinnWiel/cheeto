# Cheeto

A minimal Laravel page that renders one interactive 3D cheese curl on a black background. Drag to orbit the camera and use the scroll wheel (or pinch gesture) to zoom.

## Run locally

```bash
composer install
npm install
npm run build
php artisan serve
```

Open `http://127.0.0.1:8000`.

## Implementation

The curl is procedural Three.js geometry, not a static image or remote 3D asset. That keeps the page self-contained and lets the viewer inspect it from every angle.
