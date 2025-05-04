(function($) {
  let isDragging = false;
  let startX, currentCol, nextCol, currentColWidth, nextColWidth;

  // Загрузка сохраненных ширин
  const loadColumnWidths = () => {
    const savedWidths = JSON.parse(localStorage.getItem('redmineIssueColumnsWidth')) || {};
    $('.list.issues th, .list.issues td').each(function() {
      const colClass = $(this).attr('class').split(' ')[0];
      if (savedWidths[colClass]) {
        $(this).css('width', savedWidths[colClass]);
      }
    });
  };

  // Сохранение ширин
  const saveColumnWidths = () => {
    const widths = {};
    $('.list.issues th').each(function() {
      const colClass = $(this).attr('class').split(' ')[0];
      widths[colClass] = $(this).width() + 'px';
    });
    localStorage.setItem('redmineIssueColumnsWidth', JSON.stringify(widths));
  };

  // Обработчики событий
  $(document)
    .on('mousedown', '.list.issues th .column-resize-handle', function(e) {
      isDragging = true;
      startX = e.pageX;
      currentCol = $(this).closest('th');
      nextCol = currentCol.next();
      currentColWidth = currentCol.outerWidth();
      if (nextCol.length) nextColWidth = nextCol.outerWidth();
      
      $('body').css('cursor', 'col-resize');
      $('.list.issues').addClass('resizing');
      return false;
    })
    .on('mousemove', function(e) {
      if (!isDragging) return;
      
      const delta = e.pageX - startX;
      if (currentCol && nextCol.length) {
        wBefore = currentCol.outerWidth();
        currentCol.css('width', currentColWidth + delta + 'px');
        wAfter = currentCol.outerWidth();
        if (wBefore != wAfter) {
         nextCol.css('width', nextColWidth - delta + 'px');
        }
      }
    })
    .on('mouseup', function() {
      if (isDragging) {
        isDragging = false;
        $('body').css('cursor', '');
        $('.list.issues').removeClass('resizing');
        saveColumnWidths();
      }
    });

  // Функция сброса ширины
  const resetColumnWidths = () => {
    localStorage.removeItem('redmineIssueColumnsWidth');
    $('.list.issues th, .list.issues td').css('width', '');
  };

  // Обработчик для кнопки "Очистить"
  const handleClearClick = function(e) {
    // Выполняем сброс ширины
    resetColumnWidths();
    
    // Сохраняем оригинальную ссылку
    const originalHref = $(this).attr('href');
    
    // Выполняем оригинальное действие через 100мс
    setTimeout(() => {
      window.location.href = originalHref;
    }, 100);
    
    return false;
  };

  // Инициализация
  $(document).ready(() => {
    loadColumnWidths();
    
    // Добавляем элементы управления
    $('<style>')
      .text(`
        .list.issues th {
          position: relative;
          border-right: 2px solid #ddd !important;
        }
        
        .list.issues th:hover .column-resize-handle {
          background: #666;
        }
        
        .column-resize-handle {
          position: absolute;
          top: 0;
          right: -1px;
          width: 2px;
          height: 100%;
          background: #ddd;
          cursor: col-resize;
          z-index: 2;
          transition: background 0.2s;
        }
        
        .column-resize-handle:hover,
        .resizing .column-resize-handle {
          background: #444;
          width: 4px;
          right: -2px;
        }
        
        .list.issues.resizing * {
          user-select: none;
        }
      `)
      .appendTo('head');

    // Добавляем хэндлы к заголовкам
    $('.list.issues th').each(function() {
      $(this).append('<div class="column-resize-handle"></div>');
    });

    // Вешаем обработчик на кнопку "Очистить"
    $('a.icon-reload[href*="set_filter=1"]')
      .off('click.custom-reset')
      .on('click.custom-reset', handleClearClick);

  });
})(jQuery);

