// src/components/ResizablePanels.js
import React, { useState, useRef, useEffect } from 'react';
import { useLayout } from '../contexts/LayoutContext';

export const ResizablePanels = ({ children, direction = 'horizontal' }) => {
  const [isResizing, setIsResizing] = useState(false);
  const [sizes, setSizes] = useState([50, 50]);
  const containerRef = useRef(null);
  const { updatePanelSizes } = useLayout();

  const handleMouseDown = (index) => (e) => {
    e.preventDefault();
    setIsResizing(true);
    
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      let newSizes = [...sizes];
      
      if (direction === 'horizontal') {
        const totalWidth = containerRect.width;
        const mouseX = e.clientX - containerRect.left;
        const newLeftSize = (mouseX / totalWidth) * 100;
        const newRightSize = 100 - newLeftSize;
        
        newSizes[0] = Math.max(20, Math.min(80, newLeftSize));
        newSizes[1] = Math.max(20, Math.min(80, newRightSize));
      } else {
        const totalHeight = containerRect.height;
        const mouseY = e.clientY - containerRect.top;
        const newTopSize = (mouseY / totalHeight) * 100;
        const newBottomSize = 100 - newTopSize;
        
        newSizes[0] = Math.max(20, Math.min(80, newTopSize));
        newSizes[1] = Math.max(20, Math.min(80, newBottomSize));
      }
      
      setSizes(newSizes);
      updatePanelSizes({ editor: newSizes[0], explanation: newSizes[1] });
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    if (isResizing) {
      document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
    
    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, direction]);

  return (
    <div 
      ref={containerRef}
      className={`resizable-panels ${direction} ${isResizing ? 'resizing' : ''}`}
      style={{ 
        display: 'flex', 
        flexDirection: direction === 'horizontal' ? 'row' : 'column',
        height: '100%'
      }}
    >
      {React.Children.map(children, (child, index) => (
        <React.Fragment>
          <div style={{ 
            flex: sizes[index],
            minWidth: 0,
            minHeight: 0,
            overflow: 'hidden'
          }}>
            {child}
          </div>
          {index < children.length - 1 && (
            <div
              className={`resizable-handle ${direction}`}
              onMouseDown={handleMouseDown(index)}
              style={{
                [direction === 'horizontal' ? 'width' : 'height']: '10px',
                cursor: direction === 'horizontal' ? 'col-resize' : 'row-resize'
              }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ResizablePanels;