// src/components/Layout.js
import Sidebar from './Sidebar'; 
import Header from './Header'; 

// Tambahkan prop 'backUrl' di sini
export default function Layout({ 
  children, 
  headerTitle, 
  showBackButton, 
  backUrl, // <--- TAMBAHAN: Menerima URL tujuan back
  showSidebar = true, 
  showHeader = true, 
  userRole = 'user' 
}) {
  
  const mainWrapperClass = showSidebar ? "flex-1 ml-64 flex flex-col" : "flex-1 flex flex-col";
  
  return (
    <div className="flex min-h-screen bg-gray-50"> 
      
      {showSidebar && <Sidebar userRole={userRole} />} 
      
      <div className={mainWrapperClass}>
        
        {showHeader && (
          <Header 
            title={headerTitle} 
            showBackButton={showBackButton} 
            backUrl={backUrl} // <--- TAMBAHAN: Teruskan ke Header
          /> 
        )}
        
        <main className="flex-1 p-8"> 
          {children}
        </main>
        
      </div>
    </div>
  );
}