const $ = window.jQuery = require('jquery');
window.DataTables = require('datatables.net')();

const DataTable = $.fn.dataTable;

/* Set the defaults for DataTables initialisation */
$.extend(true, DataTable.defaults, {
  dom:
  "<'row'<'col-sm-6'l><'col-sm-6'f>>" +
  "<'row'<'col-sm-12'tr>>" +
  "<'row'<'col-sm-5'i><'col-sm-7'p>>",
  renderer: 'bootstrap',
});

/* Default class modification */
$.extend(DataTable.ext.classes, {
  sWrapper: 'dataTables_wrapper form-inline dt-bootstrap',
  sFilterInput: 'form-control input-sm',
  sLengthSelect: 'form-control input-sm',
  sProcessing: 'dataTables_processing panel panel-default',
});

/* Bootstrap paging button renderer */
DataTable.ext.renderer.pageButton.bootstrap = (settings, host, idx, buttons, page, pages) => {
  const api = new DataTable.Api(settings);
  const classes = settings.oClasses;
  const lang = settings.oLanguage.oPaginate;
  const aria = settings.oLanguage.oAria.paginate || {};
  let btnDisplay;
  let btnClass;
  let counter = 0;

  const attach = (container, buttons) => {
    let i;
    let ien;
    let node;
    let button;
    const clickHandler = (e) => {
      e.preventDefault();
      if (!$(e.currentTarget).hasClass('disabled') && api.page() !== e.data.action) {
        api.page(e.data.action).draw('page');
      }
    };

    for (i = 0, ien = buttons.length; i < ien; i += 1) {
      button = buttons[i];

      if ($.isArray(button)) {
        attach(container, button);
      } else {
        btnDisplay = '';
        btnClass = '';

        switch (button) {
          case 'ellipsis':
            btnDisplay = '&#x2026;';
            btnClass = 'disabled';
            break;

          case 'first':
            btnDisplay = lang.sFirst;
            btnClass = button + (page > 0 ? '' : ' disabled');
            break;

          case 'previous':
            btnDisplay = lang.sPrevious;
            btnClass = button + (page > 0 ? '' : ' disabled');
            break;

          case 'next':
            btnDisplay = lang.sNext;
            btnClass = button + (page < pages - 1 ? '' : ' disabled');
            break;

          case 'last':
            btnDisplay = lang.sLast;
            btnClass = button + (page < pages - 1 ? '' : ' disabled');
            break;

          default:
            btnDisplay = button + 1;
            btnClass = page === button ? 'active' : '';
            break;
        }

        if (btnDisplay) {
          node = $('<li>', {
            class: `${classes.sPageButton} ${btnClass}`,
            id: idx === 0 && typeof button === 'string'
              ? `${settings.sTableId}_${button}`
              : null,
          })
            .append($('<a>', {
              href: '#',
              'aria-controls': settings.sTableId,
              'aria-label': aria[button],
              'data-dt-idx': counter,
              tabindex: settings.iTabIndex,
            })
              .html(btnDisplay))
            .appendTo(container);

          settings.oApi._fnBindAction(node, { action: button }, clickHandler);

          counter += 1;
        }
      }
    }
  };

  attach(
    $(host).empty().html('<ul class="pagination"/>').children('ul'),
    buttons,
  );
};
