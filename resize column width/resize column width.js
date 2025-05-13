(function($) {
  let isDragging = false;
  let startX, currentCol, nextCol, currentColWidth, nextColWidth;
  const minWidth = 40;

  // Загрузка сохраненных ширин
  const loadColumnWidths = () => {
    const dataWidth = localStorage.getItem('redmineIssueColumnsWidth');
    if (dataWidth) {
      const savedWidths = JSON.parse(dataWidth) || {};
      $('.list.issues th').each(function() {
        const colClass = $(this).attr('class').split(' ')[0];
        if (savedWidths[colClass]) {
          $(this).css('width', savedWidths[colClass]);
        }
        else {
          $(this).css('width', '40px');
        }
      });
      $('.list.issues').css('table-layout', 'fixed'); // Фиксируем таблицу
    }
  };

  // Сохранение ширин
  const saveColumnWidths = () => {
    const widths = {};
    $('.list.issues th').each(function() {
      const colClass = $(this).attr('class').split(' ')[0];
      const currentWidth = $(this).width();
      widths[colClass] = currentWidth + 'px';
    });
    localStorage.setItem('redmineIssueColumnsWidth', JSON.stringify(widths));
  };

  // Обработчики событий
  $(document)
      .on('mousedown', '.list.issues th .column-resize-handle', function(e) {
        $('.list.issues th').each(function() {
          const $el = $(this);
          const currentWidth = $el.width();
          $el.css('width', currentWidth + 'px'); // Фиксируем текущую ширину
          //console.log($el.outerWidth());
        });
        $('.list.issues').css('table-layout', 'fixed'); // Фиксируем таблицу

        isDragging = true;
        startX = e.pageX;
        currentCol = $(this).closest('th');
        nextCol = currentCol.next();

        currentColWidth = currentCol.width();
        if (nextCol.length) nextColWidth = nextCol.width();

        $('body').css('cursor', 'col-resize');
        $('.list.issues').addClass('resizing');
        return false;
      })

      .on('mousemove', function(e) {
        if (!isDragging) return;

        const delta = e.pageX - startX;
        if (currentCol && nextCol.length) {
          let wBefore = currentCol.width(false);
          let currentColNewWidth = Math.max(minWidth, currentColWidth + delta);
          currentCol.css('width', currentColNewWidth + 'px');
          //console.log("currentCol", currentColWidth, delta, currentColNewWidth, currentCol.width());

          let nextColNewWidth = Math.max(minWidth, nextColWidth - delta);
          wAfter = currentCol.width();
          //if (wBefore != wAfter) {
          nextCol.css('width', nextColNewWidth + 'px');
          //}
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
    $('.list.issues th, .list.issues td').each(function() {
      const $el = $(this);
      $el.css('width', '');
    });
    $('.list.issues').css('table-layout', 'auto');
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
        }
        
        .list.issues th:hover .column-resize-handle {
          background: #666;
          width: 3px;
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
          width: 3px;
        }
        
        .list.issues.resizing * {
          user-select: none;
        }
						  

        .list.issues th {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: normal;    /* Разрешает перенос строк */ 
          word-wrap: break-word;  /* Переносит длинные слова */
          word-break: break-word; /* Универсальная поддержка */	        
        }        
	      
        /* Добавляем стили для строк */
        .list.issues td {
          white-space: normal !important;
          word-wrap: break-word !important;
//          word-break: break-word !important;
          vertical-align: top;
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
