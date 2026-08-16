const fs = require('fs');
const path = require('path');

const clientPath = path.join(__dirname, '../src/app/dashboard/orders/[id]/order-detail-client.tsx');

let clientContent = fs.readFileSync(clientPath, 'utf8');

// Fix the incorrect onImageClick -> setSelectedImage
clientContent = clientContent.replaceAll('onImageClick && onImageClick(img)', 'setSelectedImage(img)');

// Add selectedImage state
if (!clientContent.includes('const [selectedImage, setSelectedImage] = useState')) {
  clientContent = clientContent.replace(
    'const [isUpdating, setIsUpdating] = useState(false);',
    'const [isUpdating, setIsUpdating] = useState(false);\n  const [selectedImage, setSelectedImage] = useState<string | null>(null);'
  );
}

// Add the modal and onImageClick prop
if (!clientContent.includes('onImageClick={setSelectedImage}')) {
  clientContent = clientContent.replace(
    'isSavingNotes={isSavingNotes}\n    />\n    </>',
    `isSavingNotes={isSavingNotes}
      onImageClick={setSelectedImage}
    />
    
    {/* Image Viewer Modal */}
    {selectedImage && (
      <div 
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
        onClick={() => setSelectedImage(null)}
      >
        <button 
          onClick={() => setSelectedImage(null)}
          className="absolute top-4 right-4 md:top-6 md:right-6 text-white hover:text-slate-300 bg-black/50 p-2 rounded-full transition-colors"
        >
          <icons.X className="w-6 h-6" />
        </button>
        <img 
          src={selectedImage} 
          alt="Phóng to" 
          className="max-w-full max-h-full object-contain rounded shadow-2xl"
          onClick={(e) => e.stopPropagation()} 
        />
      </div>
    )}
    </>`
  );
}

fs.writeFileSync(clientPath, clientContent);

console.log('client fixed');
