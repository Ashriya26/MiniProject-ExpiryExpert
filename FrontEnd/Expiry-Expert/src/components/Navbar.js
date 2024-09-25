import React, { useState } from 'react';

const Navbar = ({ categories, onCategoryClick, onCategoryEdit }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
    const navElement = document.getElementById('nav');
    if (isOpen) {
      navElement.style.display = 'none'; // Close the navbar if currently open
    } else {
      navElement.style.display = 'flex'; // Open the navbar if currently closed
    }
    console.log('Menu icon clicked!');
  };

  return (
    <nav className={`navbar ${isOpen ? 'active' : ''}`}>
      <div className="menu-icon" onClick={toggleNavbar}>
        <img src="images/menu1.png" alt="Menu Icon" className="menu-icon-image" />
      </div>
      <ul id="nav" className={`nav-list ${isOpen ? 'active' : ''}`}>
        {categories.map((category) => (
          <li key={category} onClick={() => onCategoryClick(category)} className="nav-item">
            {category}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navbar;
