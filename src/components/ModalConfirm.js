// src/components/ModalConfirm.js
const ModalConfirm = ({ 
    title = "APAKAH ANDA YAKIN?", 
    onCancel, 
    onConfirm, 
    cancelText = "NO",
    confirmText = "YES"
}) => {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white max-w-sm p-8 rounded-xl shadow-2xl text-center">
                
                {/* Judul/Teks Konfirmasi */}
                <h3 className="text-xl font-bold text-black mb-6 whitespace-pre-line">
                    {title}
                </h3>
                
                {/* Tombol Aksi */}
                <div className="flex justify-center space-x-4 mt-4">
                    {/* Tombol Batal (Default: Putih, border Oranye) */}
                    <button
                        onClick={onCancel}
                        className="px-6 py-2 text-sm font-semibold text-[#E86500] bg-white border border-[#E86500] rounded-md hover:bg-gray-50 transition duration-150"
                    >
                        {cancelText}
                    </button>
                    {/* Tombol Konfirmasi (Default: Oranye) */}
                    <button
                        onClick={onConfirm}
                        className="px-6 py-2 text-sm font-semibold text-white bg-[#E86500] rounded-md hover:bg-[#D45A00] transition duration-150 shadow-md"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalConfirm;