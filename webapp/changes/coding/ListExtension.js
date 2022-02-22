/***
@controller Name:sap.suite.ui.generic.template.ListReport.view.ListReport,
*@viewId:mdm.cmd.product.maintain::sap.suite.ui.generic.template.ListReport.view.ListReport::C_Product
*/
sap.ui.define(
  ["sap/ui/core/mvc/ControllerExtension"],
  function (ControllerExtension) {
    "use strict";

    let _oView = null;

    return ControllerExtension.extend("ZMD_PROD_MAS_S1_A.ListExtension", {
      // this section allows to extend lifecycle hooks or override public methods of the base controller
      override: {
        /**
         * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
         * @memberOf ZMD_PROD_MAS_S1_A.ListExtension
         */
        onInit: function () {
          // get view instance
          _oView = this.getView();
        },

        /**
         * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
         * (NOT before the first rendering! onInit() is used for that one!).
         * @memberOf ZMD_PROD_MAS_S1_A.ListExtension
         */
        onBeforeRendering: () => _oView.getModel().setSizeLimit(999),
      },
    });
  }
);
