// src/core/drag-drop.js
export class DragDropSystem {
    constructor(container) {
      this.container = container;
      this.draggedElement = null;
      this.dropZones = new Map();
      this.isDragging = false;
  
      this._init();
    }
  
    _init() {
      this.container.addEventListener('dragstart', this._onDragStart.bind(this));
      this.container.addEventListener('dragend', this._onDragEnd.bind(this));
      this.container.addEventListener('dragover', this._onDragOver.bind(this));
      this.container.addEventListener('drop', this._onDrop.bind(this));
    }
  
    registerDropZone(element, options = {}) {
      const dropZone = {
        element,
        accept: options.accept || ['block'],
        onDrop: options.onDrop,
        onDragOver: options.onDragOver,
        onDragLeave: options.onDragLeave
      };
  
      this.dropZones.set(element, dropZone);
  
      element.addEventListener('dragover', this._handleDragOver.bind(this, dropZone));
      element.addEventListener('drop', this._handleDrop.bind(this, dropZone));
      element.addEventListener('dragleave', this._handleDragLeave.bind(this, dropZone));
  
      return () => {
        this.dropZones.delete(element);
        element.removeEventListener('dragover', this._handleDragOver);
        element.removeEventListener('drop', this._handleDrop);
        element.removeEventListener('dragleave', this._handleDragLeave);
      };
    }
  
    makeDraggable(element, data) {
      element.draggable = true;
      element.dataset.dragType = data.type || 'block';
      element.dataset.dragData = JSON.stringify(data);
  
      element.addEventListener('dragstart', (e) => {
        this._setDragData(e, data);
      });
  
      return () => {
        element.draggable = false;
        delete element.dataset.dragType;
        delete element.dataset.dragData;
      };
    }
  
    _onDragStart(e) {
      const target = e.target.closest('[draggable="true"]');
      if (!target) return;
  
      this.draggedElement = target;
      this.isDragging = true;
  
      const dragType = target.dataset.dragType;
      const dragData = target.dataset.dragData;
  
      e.dataTransfer.setData('application/json', dragData);
      e.dataTransfer.setData('text/plain', dragType);
      e.dataTransfer.effectAllowed = 'copyMove';
  
      // 添加拖动视觉效果
      target.classList.add('dragging');
      
      // 创建拖动镜像
      this._createDragImage(e, target);
    }
  
    _onDragEnd(e) {
      if (this.draggedElement) {
        this.draggedElement.classList.remove('dragging');
        this.draggedElement = null;
      }
      
      this.isDragging = false;
      
      // 清除所有拖放区域的样式
      this.dropZones.forEach((dropZone, element) => {
        element.classList.remove('drag-over');
      });
    }
  
    _onDragOver(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    }
  
    _onDrop(e) {
      e.preventDefault();
      
      if (!this.isDragging) return;
  
      const dragType = e.dataTransfer.getData('text/plain');
      const dragData = e.dataTransfer.getData('application/json');
      
      try {
        const data = JSON.parse(dragData);
        this._handleGlobalDrop(e, data, dragType);
      } catch (error) {
        console.error('解析拖放数据失败:', error);
      }
    }
  
    _handleDragOver(dropZone, e) {
      e.preventDefault();
      e.stopPropagation();
  
      if (this._canAcceptDrop(dropZone, e)) {
        e.dataTransfer.dropEffect = 'copy';
        dropZone.element.classList.add('drag-over');
        
        if (dropZone.onDragOver) {
          dropZone.onDragOver(e, this._getDragData(e));
        }
      } else {
        e.dataTransfer.dropEffect = 'none';
      }
    }
  
    _handleDrop(dropZone, e) {
      e.preventDefault();
      e.stopPropagation();
  
      dropZone.element.classList.remove('drag-over');
  
      if (this._canAcceptDrop(dropZone, e)) {
        const data = this._getDragData(e);
        
        if (dropZone.onDrop) {
          dropZone.onDrop(e, data);
        }
      }
    }
  
    _handleDragLeave(dropZone, e) {
      e.preventDefault();
      e.stopPropagation();
  
      if (!dropZone.element.contains(e.relatedTarget)) {
        dropZone.element.classList.remove('drag-over');
        
        if (dropZone.onDragLeave) {
          dropZone.onDragLeave(e);
        }
      }
    }
  
    _handleGlobalDrop(e, data, type) {
      // 处理全局拖放事件
      const event = new CustomEvent('global-drop', {
        bubbles: true,
        detail: {
          data,
          type,
          x: e.clientX,
          y: e.clientY
        }
      });
      
      this.container.dispatchEvent(event);
    }
  
    _canAcceptDrop(dropZone, e) {
      const dragType = e.dataTransfer.getData('text/plain');
      return dropZone.accept.includes(dragType);
    }
  
    _getDragData(e) {
      try {
        const jsonData = e.dataTransfer.getData('application/json');
        return JSON.parse(jsonData);
      } catch (error) {
        return null;
      }
    }
  
    _setDragData(e, data) {
      e.dataTransfer.setData('application/json', JSON.stringify(data));
      e.dataTransfer.setData('text/plain', data.type || 'block');
    }
  
    _createDragImage(e, element) {
      // 创建拖动时的镜像元素
      const rect = element.getBoundingClientRect();
      const dragImage = element.cloneNode(true);
      
      dragImage.style.position = 'fixed';
      dragImage.style.top = '-1000px';
      dragImage.style.left = '-1000px';
      dragImage.style.width = `${rect.width}px`;
      dragImage.style.height = `${rect.height}px`;
      dragImage.style.opacity = '0.8';
      dragImage.style.pointerEvents = 'none';
      dragImage.style.zIndex = '10000';
      
      document.body.appendChild(dragImage);
      
      e.dataTransfer.setDragImage(dragImage, rect.width / 2, rect.height / 2);
      
      // 清理临时元素
      setTimeout(() => {
        if (document.body.contains(dragImage)) {
          document.body.removeChild(dragImage);
        }
      }, 0);
    }
  
    // 块重排序功能
    enableBlockReordering(container, onReorder) {
      let draggedBlock = null;
      let placeholder = null;
  
      container.querySelectorAll('.block-item').forEach(block => {
        this.makeDraggable(block, {
          type: 'block-reorder',
          blockId: block.dataset.blockId
        });
      });
  
      this.registerDropZone(container, {
        accept: ['block-reorder'],
        onDragOver: (e, data) => {
          if (!placeholder) {
            placeholder = this._createPlaceholder();
            container.appendChild(placeholder);
          }
          
          this._updatePlaceholderPosition(e, container, draggedBlock);
        },
        onDrop: (e, data) => {
          if (placeholder && draggedBlock) {
            const newIndex = this._getBlockIndex(container, placeholder);
            const oldIndex = this._getBlockIndex(container, draggedBlock);
            
            if (newIndex !== -1 && oldIndex !== -1 && newIndex !== oldIndex) {
              onReorder(oldIndex, newIndex);
            }
          }
          
          this._cleanupReordering();
        },
        onDragLeave: () => {
          this._cleanupReordering();
        }
      });
  
      // 更新内部引用
      container.addEventListener('dragstart', (e) => {
        draggedBlock = e.target.closest('.block-item');
      });
  
      container.addEventListener('dragend', () => {
        this._cleanupReordering();
        draggedBlock = null;
      });
    }
  
    _createPlaceholder() {
      const placeholder = document.createElement('div');
      placeholder.className = 'block-placeholder';
      placeholder.style.height = '60px';
      placeholder.style.background = 'rgba(var(--cf-rgb-primary), 0.1)';
      placeholder.style.border = '2px dashed var(--cf-primary-color)';
      placeholder.style.borderRadius = 'var(--cf-radius-md)';
      placeholder.style.margin = 'var(--cf-spacing-sm) 0';
      return placeholder;
    }
  
    _updatePlaceholderPosition(e, container, draggedBlock) {
      const blocks = Array.from(container.querySelectorAll('.block-item:not(.dragging)'));
      const mouseY = e.clientY;
      
      let insertIndex = -1;
      
      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        const rect = block.getBoundingClientRect();
        const blockMiddle = rect.top + rect.height / 2;
        
        if (mouseY < blockMiddle) {
          insertIndex = i;
          break;
        }
      }
      
      if (insertIndex === -1) {
        insertIndex = blocks.length;
      }
      
      const referenceBlock = blocks[insertIndex] || null;
      
      if (referenceBlock) {
        container.insertBefore(placeholder, referenceBlock);
      } else {
        container.appendChild(placeholder);
      }
    }
  
    _getBlockIndex(container, element) {
      return Array.from(container.children).indexOf(element);
    }
  
    _cleanupReordering() {
      if (placeholder && placeholder.parentNode) {
        placeholder.parentNode.removeChild(placeholder);
      }
      placeholder = null;
    }
  
    destroy() {
      this.container.removeEventListener('dragstart', this._onDragStart);
      this.container.removeEventListener('dragend', this._onDragEnd);
      this.container.removeEventListener('dragover', this._onDragOver);
      this.container.removeEventListener('drop', this._onDrop);
      
      this.dropZones.clear();
    }
  }