// src/components/ModalInfo.js
const ModalInfo = ({ 
    title = "INFORMASI", 
    description, 
    onClose, 
    okText = "Oke"
}) => {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white max-w-sm p-8 rounded-xl shadow-2xl text-center">
                
                {/* Judul/Teks Utama (Hitam) */}
                <h3 className="text-2xl font-bold text-black mb-2">
                    {title}
                </h3>
                
                {/* Deskripsi Singkat (Abu-abu) */}
                {description && (
                    <p className="text-gray-600 mb-6 whitespace-pre-line">
                        {description}
                    </p>
                )}
                
                {/* Tombol OK (Default: Oranye) */}
                <button
                    onClick={onClose}
                    className="w-full px-6 py-2 text-md font-semibold text-white bg-[#E86500] rounded-md hover:bg-[#D45A00] transition duration-150 shadow-md mt-4"
                >
                    {okText}
                </button>
            </div>
        </div>
    );
};

export default ModalInfo;