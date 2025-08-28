$(document).ready(function() {
  // ======================
  // 1. КОНФИГУРАЦИЯ ГРУПП
  // ======================
  const QUERY_GROUPS_CONFIG = [
    {
      name: 'Группа A (ID, Subject)',
      query_ids: ['1', '2', '3'],
      columns: {
        id: { width: 145, align: 'center', color: 'blue', fontWeight: 'bold', backgroundColor: 'black' },
        subject: { width: 300, align: 'left' }
      }
    },
    {
      name: 'Группа B (ID, Status)',
      query_ids: ['4', '5', '6'],
      columns: {
        id: { width: 120, align: 'right', color: 'darkred' },
        status: { width: 200, align: 'center', backgroundColor: '#f5f5f5' }
      }
    },
    {
      name: 'Группа C (ID, Tracker, Priority)',
      query_ids: ['7', '8', '9'],
      columns: {
        id: { width: 100, align: 'center' },
        tracker: { width: 150, align: 'left' },
        priority: { width: 120, align: 'center', fontWeight: 'bold' }
      }
    },
    {
      name: 'Специальный случай для 10',
      query_ids: ['10'],
      columns: {
        id: { width: 180, align: 'center', color: 'blue' },
        subject: { width: 350, align: 'left' },
        assigned_to: { width: 200, align: 'left' }
      }
    }
  ];

  // ======================
  // 2. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
  // ======================
  function applyColumnConfig(config, tableSelector = '.list.issues') {
    // Проверка существования таблицы
    if ($(tableSelector).length === 0) {
      console.debug(`Таблица ${tableSelector} не найдена. Стили не применены.`);
      return;
    }

    // Применение конфигурации столбцов
    Object.entries(config.columns).forEach(([columnName, columnConfig]) => {
      // Ключевое исправление: добавлены селекторы для дочерних элементов
      const selector = [
        `${tableSelector} th.${columnName}`,
        `${tableSelector} td.${columnName}`,
        `${tableSelector} th.${columnName} > a`,
        `${tableSelector} td.${columnName} > a`,
        `${tableSelector} th.${columnName} > span`,
        `${tableSelector} td.${columnName} > span`,
        `${tableSelector} th.${columnName} > div`,
        `${tableSelector} td.${columnName} > div`
      ].join(', ');
      
      const $elements = $(selector);
      
      if (!$elements.length) {
        console.debug(`Столбец ${columnName} не найден в таблице ${tableSelector}`);
        return;
      }
      
      // Базовые стили для фиксированной ширины
      const widthValue = typeof columnConfig.width === 'number' 
        ? `${columnConfig.width}px` 
        : columnConfig.width;
        
      const styles = {
        width: widthValue,
        'min-width': widthValue,
        'max-width': widthValue,
        'white-space': 'nowrap',
        'overflow': 'hidden',
        'text-overflow': 'ellipsis'
      };
      
      // Маппинг дополнительных свойств на CSS
      const cssPropertyMap = {
        align: 'text-align',
        color: 'color',
        backgroundColor: 'background-color',
        fontWeight: 'font-weight',
        fontStyle: 'font-style',
        textDecoration: 'text-decoration',
      };
      
      // Применение дополнительных стилей
      Object.entries(cssPropertyMap).forEach(([configProp, cssProp]) => {
        if (columnConfig[configProp] !== undefined) {
          styles[cssProp] = columnConfig[configProp];
        }
      });
      
      $elements.css(styles);
    });
    
    // Установка ширины таблицы
    $(tableSelector).css('width', '100%');
  }

  // ======================
  // 3. ОСНОВНАЯ ЛОГИКА
  // ======================
  const queryId = ($('.queries .selected').attr('href') || '').match(/query_id=(\d+)/)?.[1] 
    ?? $('#contact-issues').attr('query-id')
    ?? null;
    
  const normalizedQueryId = queryId
    ? /^\d+$/.test(queryId.trim())
      ? queryId.trim()
      : (console.warn(`Некорректный queryId: ${queryId}`), null)
    : null;

  const matchedGroup = QUERY_GROUPS_CONFIG.find(group => 
    group.query_ids.includes(normalizedQueryId)
  );

  if (matchedGroup) {
    applyColumnConfig(matchedGroup);
    console.log(`Применена конфигурация: ${matchedGroup.name}`);
  } else if (normalizedQueryId) {
    console.log(`Неизвестный query_id: ${normalizedQueryId}`);
  } else {
    console.log('query_id не определен (рабочая ситуация)');
  }
  
  // ======================
  // 4. ОБРАБОТКА AJAX-ОБНОВЛЕНИЙ
  // ======================
  $(document).on('ajaxComplete', function() {
    if (matchedGroup) {
      applyColumnConfig(matchedGroup);
      console.debug(`Конфигурация "${matchedGroup.name}" восстановлена после AJAX-запроса`);
    }
  });
});
