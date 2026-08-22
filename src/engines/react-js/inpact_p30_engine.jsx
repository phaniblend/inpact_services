import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #30", title: "Image Gallery", body: `Build a grid of images with a click-to-enlarge modal. Clicking an image opens a modal (or overlay) showing the full-size image; clicking outside or a close button closes it.`, usecase: "Galleries and lightboxes use this pattern everywhere." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["State: selectedImage (URL or null) for which image is enlarged", "Render a grid of thumbnails (e.g. 3–6 images)", "Click thumbnail: set selectedImage to that image URL", "Modal: when selectedImage is set, show overlay with large image and close button or click-outside to close"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create state: const [selectedImage, setSelectedImage] = useState(null). Define an array of image URLs. Render a grid of images (e.g. display: grid, gridTemplateColumns: 'repeat(3, 1fr)'). Each img is clickable.", hint: "images.map((url, i) => <img key={i} src={url} onClick={() => setSelectedImage(url)} style={{ width: '100%', cursor: 'pointer' }} />)", answer_keywords: ["usestate", "selectedimage", "setselectedimage", "grid", "img", "onclick"], seed_code: `import { useState } from 'react'

const images = ['https://picsum.photos/200/200?1', 'https://picsum.photos/200/200?2', 'https://picsum.photos/200/200?3']

export default function ImageGallery() {
  const [selectedImage, setSelectedImage] = useState(null)
  // Step 1: grid of clickable images
}`, feedback_correct: "✅ Grid of thumbnails, click sets selectedImage.", feedback_partial: "Grid and onClick to set selected image.", feedback_wrong: "Grid of img, onClick={() => setSelectedImage(url)}", expected: "Grid + click sets selectedImage." },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "When selectedImage is not null, render a modal (fixed overlay): a div that covers the screen (position: fixed, inset: 0, background: rgba(0,0,0,0.8)), with the large image in the center and a close button. Clicking close sets selectedImage to null.", hint: "{selectedImage && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><img src={selectedImage} /><button onClick={() => setSelectedImage(null)}>Close</button></div>}", answer_keywords: ["modal", "fixed", "overlay", "selectedimage", "close", "button"], seed_code: `import { useState } from 'react'

const images = ['https://picsum.photos/200/200?1', 'https://picsum.photos/200/200?2', 'https://picsum.photos/200/200?3']

export default function ImageGallery() {
  const [selectedImage, setSelectedImage] = useState(null)
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {images.map((url, i) => <img key={i} src={url} onClick={() => setSelectedImage(url)} style={{ width: '100%', cursor: 'pointer' }} alt="" />)}
      </div>
      {/* Step 2: modal when selectedImage is set */}
    </div>
  )
}`, feedback_correct: "✅ Modal with large image and close.", feedback_partial: "Overlay with image and close button.", feedback_wrong: "selectedImage && overlay with img and setSelectedImage(null)", expected: "Modal with image and close handler." },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Optional: clicking the overlay background (not the image) closes the modal. Export the component.", hint: "onClick on overlay div: setSelectedImage(null). onClick on img: e.stopPropagation() so clicking image doesn't close.", answer_keywords: ["stopPropagation", "overlay", "export"], seed_code: `import { useState } from 'react'

const images = ['https://picsum.photos/200/200?1', 'https://picsum.photos/200/200?2', 'https://picsum.photos/200/200?3']

export default function ImageGallery() {
  const [selectedImage, setSelectedImage] = useState(null)
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {images.map((url, i) => <img key={i} src={url} onClick={() => setSelectedImage(url)} style={{ width: '100%', cursor: 'pointer' }} alt="" />)}
      </div>
      {selectedImage && (
        <div onClick={() => setSelectedImage(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={selectedImage} alt="" onClick={e => e.stopPropagation()} style={{ maxWidth: '90%', maxHeight: '90%' }} />
          <button onClick={() => setSelectedImage(null)} style={{ position: 'absolute', top: 16, right: 16 }}>Close</button>
        </div>
      )}
    </div>
  )
}`, feedback_correct: "✅ Image gallery with click-to-enlarge modal complete.", feedback_partial: "Click overlay to close, export.", feedback_wrong: "Overlay click closes; stopPropagation on image.", expected: "Click overlay to close; stopPropagation on image. Export the gallery component." },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];

export default createINPACTEngine({ NODES, sideItems, lessonNum: 30, title: "Image Gallery", shortName: "IMAGE GALLERY" });
