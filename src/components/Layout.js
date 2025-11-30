// src/components/Layout.js
import Sidebar from './Sidebar'; 
import Header from './Header'; 

// Menerima prop userRole dengan default 'user'
export default function Layout({ children, headerTitle, showBackButton, showSidebar = true, showHeader = true, userRole = 'user' }) {
  
  // Logika penentuan margin kiri (ml-64) tetap sama
  const mainWrapperClass = showSidebar ? "flex-1 ml-64 flex flex-col" : "flex-1 flex flex-col";
  
  return (
    <div className="flex min-h-screen bg-gray-50"> 
      
      {/* 1. Sidebar (Conditional Rendering) */}
      {/* Meneruskan prop userRole ke Sidebar */}
      {showSidebar && <Sidebar userRole={userRole} />} 
      
      {/* Container Konten Utama */}
      <div className={mainWrapperClass}>
        
        {/* 2. Header (Conditional Rendering) */}
        {showHeader && (
          <Header title={headerTitle} showBackButton={showBackButton} /> 
        )}
        
        {/* 3. Konten Utama */}
        <main className="flex-1 p-8"> 
          {children}
        </main>
        
      </div>
    </div>
  );
}