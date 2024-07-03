/***
@controller Name:sap.suite.ui.generic.template.ObjectPage.view.Details,
*@viewId:mdm.cmd.product.maintain::sap.suite.ui.generic.template.ObjectPage.view.Details::C_Product
*/

sap.ui.define(
  [
    "sap/ui/core/mvc/ControllerExtension",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/layout/form/SimpleForm",
    "sap/m/Dialog",
    "sap/m/Table",
    "sap/m/ColumnListItem",
    "sap/m/Column",
    "sap/m/Label",
    "sap/m/Input",
    "sap/m/Text",
    "sap/m/TextArea",
    "sap/m/ComboBox",
    "sap/m/Select",
    "sap/ui/core/Item",
    "sap/ui/core/ListItem",
    "sap/m/Button",
    "sap/m/OverflowToolbar",
    "sap/m/Title",
    "sap/m/ToolbarSpacer",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/base/Log",
  ],
  function (
    ControllerExtension,
    JSONModel,
    Filter,
    FilterOperator,
    SimpleForm,
    Dialog,
    Table,
    ColumnListItem,
    Column,
    Label,
    Input,
    Text,
    TextArea,
    ComboBox,
    Select,
    Item,
    ListItem,
    Button,
    OverflowToolbar,
    Title,
    ToolbarSpacer,
    MessageBox,
    MessageToast,
    Log
  ) {
    "use strict";

    let _oCodeTypeDialog = null;
    let _oCodeTypeTable = null;
    let _bMaterialTypeLoaded = false;
    let _aMaterialTypesList = [];
    let _oView = null;
    let _aStatusRestrict = [];
    let _bCompact = null;
    const _sGroupId = `${new Date().getTime()}`;
    const _sCustomerNamespace = "customer.ZMD_PROD_MAS_S1_A";
    let _oCustomerViewModel = new JSONModel({
      bEDUKStopAcc: false,
      bEDUKStopBill: false,
    });
    let _oLeadTimeIndicatorModel = new JSONModel();
    let _oRowData;
    let _oObjectData;
    let _aProductCompositionIndicator = [];

    return ControllerExtension.extend("ZMD_PROD_MAS_S1_A.ObjectExtension", {
      // this section allows to extend lifecycle hooks or override public methods of the base controller
      override: {
        /**
         * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
         * @memberOf ZMD_PROD_MAS_S1_A.ObjectExtension
         */

        onInit: function () {
          // get view instance
          _oView = this.getView();

          // load material types after rendering
          _oView.attachEventOnce("afterRendering", (_) => {
            // load material type
            this._loadMaterialTypes();

            // load Product Composition Indicator details
            this._loadProductCompositionIndicator();
          });

          // set model to view
          _oView.setModel(_oCustomerViewModel, "oCustomerViewModel");

          // set model to view
          _oView.setModel(_oLeadTimeIndicatorModel, "oLeadTimeIndicatorModel");

          // get compact size for message box
          _bCompact = !!_oView.$().closest(".sapUiSizeCompact").length;

          // attach page data loaded on odata callback with context as response
          _oView
            .getController()
            .extensionAPI.attachPageDataLoaded(async (oData) => {
              let sPath = oData.context.getPath();
              let oDataVal = oData.context.getObject();

              // get path of the entity
              sPath = sPath.substr(1, sPath.indexOf("(") - 1);

              // update object page data
              if (sPath === "C_Product") {
                _oObjectData = oDataVal;
              }

              // object page hook methods
              if (sPath === "C_Productsalesdelivery") {
                // check status is loaded
                const aStatusRestrict = await this._loadStatusRestrict();

                // toggle eduk fields visibility
                this._disChainFieldVisibility(aStatusRestrict);
              }

              // object page - plant (lead time indicator)
              if (sPath === "C_Productplant") {
                // this._loadLeadTimeIndicator(oDataVal.Plant || "");

                const sViewId = _oView.getId();
                const oSelectBox = sap.ui
                  .getCore()
                  .byId(
                    `${sViewId}--${_sCustomerNamespace}.idSubSectionFieldP01-1`
                  );
                let sPlant = oDataVal.Plant;

                if (!sPlant) {
                  sPlant = oDataVal.ProductForEdit;
                }

                // attach event on press
                this._plantTableFilter(oSelectBox, sPlant);
              }
            });
        },

        /**
         * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
         * This hook is the same one that SAPUI5 controls get after being rendered.
         * @memberOf ZMD_PROD_MAS_S1_A.Object
         */
        onAfterRendering: function () {
          setTimeout(() => {
            //=====================================
            // display mode key with description
            //=====================================

            // oup reporting - tab

            // subject description
            this._loadSmartFieldDescription(
              "idSubSectionField1",
              "ZZ1_Subject_PRDT"
            );
            // Product Type description
            this._loadSmartFieldDescription(
              "idSubSectionField2",
              "ZZ1_ProductType_PRDT"
            );
            // Market
            this._loadSmartFieldDescription(
              "idSubSectionField3",
              "ZZ1_Market_PRDT"
            );
            // Level
            this._loadSmartFieldDescription(
              "idSubSectionField4",
              "ZZ1_Level_PRDT"
            );
            // Pack Info
            this._loadSmartFieldDescription(
              "idSubSectionField5",
              "ZZ1_PackInformation_PRDT"
            );
            // Responsible Editor
            this._loadSmartFieldDescription(
              "idSubSectionField11",
              "ZZ1_ResponsibleEditor_PRDT"
            );
            // Source
            this._loadSmartFieldDescription(
              "idSubSectionField12",
              "ZZ1_Source_PRDT"
            );
            // Composer/Author
            this._loadSmartFieldDescription(
              "idSubSectionField13",
              "ZZ1_ComposerAuthor_PRDT"
            );
            // Other Rights
            this._loadSmartFieldDescription(
              "idSubSectionField6",
              "ZZ1_OtherRights_PRDT"
            );
            // Bookclub Rights
            this._loadSmartFieldDescription(
              "idSubSectionField7",
              "ZZ1_BookclubRights_PRDT"
            );
            // Translation Rights
            this._loadSmartFieldDescription(
              "idSubSectionField8",
              "ZZ1_TranslationRights_PRDT"
            );
            // Inspection Flag
            this._loadSmartFieldDescription(
              "idSubSectionField9",
              "ZZ1_InspectionFlag_PRDT"
            );
            // Royalty Flag
            this._loadSmartFieldDescription(
              "idSubSectionField10",
              "ZZ1_RoyaltyFlag_PRDT"
            );
            // Digital Licence Period
            this._loadSmartFieldDescription(
              "idSubSectionField17",
              "ZZ1_DigitalLicencePeri_PRDT"
            );
            // Title owned by Branch
            this._loadSmartFieldDescription(
              "idSubSectionFieldCR18",
              "ZZ1_TITLE_BRANCH_PRDT"
            );

            // physical characterisitics - tab

            // Media Type
            this._loadSmartFieldDescription(
              "idSubSectionField18",
              "ZZ1_MediaType_PRDT"
            );
            // Standard Format
            this._loadSmartFieldDescription(
              "idSubSectionField20",
              "ZZ1_StandardFormat_PRDT"
            );
            // Product Presentation
            this._loadSmartFieldDescription(
              "idSubSectionField21",
              "ZZ1_ProdPresentation_PRDT"
            );
            // Feature1
            this._loadSmartFieldDescription(
              "idSubSectionField22",
              "ZZ1_Feature1_PRDT"
            );
            // Feature2
            this._loadSmartFieldDescription(
              "idSubSectionField24",
              "ZZ1_Feature2_PRDT"
            );
            // Specification fields - Bleeds
            this._loadSmartFieldDescription(
              "idSubSectionField37",
              "ZZ1_Bleeds_PRDT"
            );
            // Specification fields - Plates
            this._loadSmartFieldDescription(
              "idSubSectionField40",
              "ZZ1_Plates_PRDT"
            );

            // basic media 1 - tab

            // Header - ID Code Type
            this._loadSmartFieldDescription(
              "idSubSectionField45",
              "ZZ1_IDCodeType_PRDT"
            );
            // Header - Languages
            this._loadSmartFieldDescription(
              "idSubSectionField51",
              "ZZ1_Languages_PRDT"
            );
            // Media product series description
            this._loadSmartFieldDescription(
              "idSubSectionField54",
              "ZZ1_Mediaproductserie_PRDT"
            );
            // Assignment - Content Category
            this._loadSmartFieldDescription(
              "idSubSectionField56",
              "ZZ1_ContentCategory_PRDT"
            );
            // Assignment - Publication type
            this._loadSmartFieldDescription(
              "idSubSectionField57",
              "ZZ1_PublicationType_PRDT"
            );
            // Publication - Reprinting type
            this._loadSmartFieldDescription(
              "idSubSectionField63",
              "ZZ1_ReprintingType_PRDT"
            );
            // Publication - Edition Category
            this._loadSmartFieldDescription(
              "idSubSectionField64",
              "ZZ1_EditionCategory_PRDT"
            );

            // basic media 2 - tab

            // First Publication-ID code type
            this._loadSmartFieldDescription(
              "idSubSectionField69",
              "ZZ1_FirstPubIdCode_PRDT"
            );
            // IBP relevant fields-ABC Indicator
            this._loadSmartFieldDescription(
              "idSubSectionField73",
              "ZZ1_ABCIndicator_PRDT"
            );
            // IBP relevant fields-XYZ Indicator
            this._loadSmartFieldDescription(
              "idSubSectionField74",
              "ZZ1_XYZIndicator_PRDT"
            );

            // plant - general information - tab

            // Lead time indicator profile
            this._loadSmartFieldDescription(
              "idSubSectionFieldP01",
              "LeadTimeIndicatorDescription"
            );

            //=================
            // selectbox lables
            //=================

            // oup reporting - tab

            // Other Rights
            this._setLabelsForSelectBox("idSubSectionField6-1", "Other Rights");
            // Bookclub Rights
            this._setLabelsForSelectBox(
              "idSubSectionField7-1",
              "Bookclub Rights"
            );
            // Translation Rights
            this._setLabelsForSelectBox(
              "idSubSectionField8-1",
              "Translation Rights"
            );
            // Inspection Flag
            this._setLabelsForSelectBox(
              "idSubSectionField9-1",
              "Inspection Flag"
            );
            // Royalty Flag
            this._setLabelsForSelectBox(
              "idSubSectionField10-1",
              "Royalty Flag"
            );
            // Digital Licence Period
            this._setLabelsForSelectBox(
              "idSubSectionField17-1",
              "Digital Licence Period"
            );
            // Title owned by Branch
            this._setLabelsForSelectBox(
              "idSubSectionFieldCR18-1",
              "Title owned by Branch"
            );

            // physical characterisitics - tab

            // Media Type
            this._setLabelsForSelectBox("idSubSectionField18-1", "Media Type");
            // Extent
            this._setLabelsForSelectBox("idSubSectionField19-1", "Extent");
            // Standard Format
            this._setLabelsForSelectBox(
              "idSubSectionField20-1",
              "Standard Format"
            );
            // Product Presentation
            this._setLabelsForSelectBox(
              "idSubSectionField21-1",
              "Prod presentation"
            );
            // Feature1
            this._setLabelsForSelectBox("idSubSectionField22-1", "Feature 1");
            // Feature1 Quantity with UOM
            this._setLabelsForSelectBox(
              "idSubSectionField23-1",
              "Unit for Feature1"
            );
            // Feature2
            this._setLabelsForSelectBox("idSubSectionField24-1", "Feature 2");
            // Unit for Feature2 Quantity
            this._setLabelsForSelectBox(
              "idSubSectionField25-1",
              "Unit for Feature2"
            );
            // Dimensions-Length Format
            this._setLabelsForSelectBox(
              "idSubSectionField26-1",
              "Length format"
            );
            // Width-Length Format
            this._setLabelsForSelectBox(
              "idSubSectionField27-1",
              "Width format"
            );
            // Thickness Format
            this._setLabelsForSelectBox("idSubSectionField28-1", "Thickness");
            // Paper/Page of weights - Weight of paper
            this._setLabelsForSelectBox(
              "idSubSectionField29-1",
              "Weight of paper"
            );
            // Paper/Page of weights - Leaf Weight
            this._setLabelsForSelectBox("idSubSectionField30-1", "Leaf weight");
            // Paper/Page of weights - Paper wt common part
            this._setLabelsForSelectBox(
              "idSubSectionField31-1",
              "Paper wt common part"
            );
            // Paper/Page of weights - LWt Common part
            this._setLabelsForSelectBox(
              "idSubSectionField32-1",
              "Leaf Wt common part"
            );
            // Specification fields - Bleeds
            this._setLabelsForSelectBox("idSubSectionField37-1", "Bleeds");
            // Specification fields - Plates
            this._setLabelsForSelectBox("idSubSectionField40-1", "Plates");

            // basic media 1 - tab

            // Header - Languages
            this._setLabelsForSelectBox("idSubSectionField51-1", "Languages");
            // Assignment - Media product Series
            // this._setLabelsForSelectBox(
            //   "idSubSectionField54-1",
            //   "Media product series"
            // );
            // Assignment - Content Category
            this._setLabelsForSelectBox(
              "idSubSectionField56-1",
              "Content Category"
            );
            // Assignment - Publication type
            this._setLabelsForSelectBox(
              "idSubSectionField57-1",
              "Publication Type"
            );
            // Assignment - Media type
            this._setLabelsForSelectBox("idSubSectionField58-1", "Media Type");
            // Publication - Reprinting type
            this._setLabelsForSelectBox(
              "idSubSectionField63-1",
              "Reprinting Type"
            );
            // Publication - Edition Category
            this._setLabelsForSelectBox(
              "idSubSectionField64-1",
              "Edition Category"
            );
            // IP Assignment - IP number
            // this._setLabelsForSelectBox("idSubSectionField65-1", "IP number");
            // IP Assignment - Short Text for an IP
            this._setLabelsForSelectBox(
              "idSubSectionField66-1",
              "Short Text for an IP"
            );

            // basic media 2 - tab

            // First Publication - ID code type
            this._setLabelsForSelectBox(
              "idSubSectionField69-1",
              "ID Code Type"
            );
            // IBP relevant fields - NewEstFlag
            this._setLabelsForSelectBox(
              "idSubSectionField71-1",
              "New/Est Flag"
            );
            // IBP relevant fields - SOFT Indicator
            this._setLabelsForSelectBox(
              "idSubSectionField72-1",
              "SOFT Indicator"
            );
            // IBP relevant fields - ABC Indicator
            this._setLabelsForSelectBox(
              "idSubSectionField73-1",
              "ABC Indicator"
            );
            // IBP relevant fields - XYZ Indicator
            this._setLabelsForSelectBox(
              "idSubSectionField74-1",
              "XYZ Indicator"
            );

            // plant - general information - tab

            // Lead time indicator profile
            this._setLabelsForSelectBox(
              "idSubSectionFieldP01-1",
              "Lead time indicator profile"
            );
            // GHIJ Indicator
            this._setLabelsForSelectBox(
              "idSubSectionFieldP02-1",
              "GHIJ Indicator"
            );
            // New/Est Flag
            this._setLabelsForSelectBox(
              "idSubSectionFieldP03-1",
              "New/Est Flag"
            );
            // SOFT Indicator
            this._setLabelsForSelectBox(
              "idSubSectionFieldP04-1",
              "SOFT Indicator"
            );
          }, 100);
        },

        /**
         * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
         * @memberOf ZMD_PROD_MAS_S1_A.ObjectExtension
         */
        onExit: function () {
          try {
            _oCodeTypeDialog.destroy();
          } catch (_) {
            Log.info(`No objects found to destroy!`);
          }
        },
      },

      onCodeTypePress: async function (oEvent) {
        const sProduct = _oView
          .getContent()[0]
          .getHeaderTitle()
          .getObjectSubtitle();
        const oBindingContext = oEvent.getSource().getBindingContext();
        const oData = oBindingContext.getObject();

        // save globally
        _oRowData = oBindingContext.getObject();

        const _oCodeTypePopoverODataModel =
          _oView.getModel("customer.codeType");

        if (!_oCodeTypeDialog) {
          // set deferred group for batch operations
          _oCodeTypePopoverODataModel.setDeferredGroups(
            _oCodeTypePopoverODataModel.getDeferredGroups().concat([_sGroupId])
          );

          const aIdCodeTypes = await this._loadIdCodeTypes();
          const aIdCodeTypesListItem = [];

          for (let i = 0, iLen = aIdCodeTypes.length; i < iLen; i++) {
            aIdCodeTypesListItem.push(
              new ListItem({
                key: aIdCodeTypes[i].Code,
                text: aIdCodeTypes[i].Description,
                additionalText: aIdCodeTypes[i].Code,
              })
            );
          }

          // form
          const oCodeTypeForm = new SimpleForm({
            editable: true,
            content: [
              // Material
              new Label({
                text: "Material No.",
              }),
              new Text({
                text: "{MATNR}",
              }),

              // ID Code Type
              new Label({
                text: "ID Code Type",
                required: true,
              }),
              new ComboBox("idCodeType-CodeTypeForm", {
                selectedKey: "{ISMIDCODETYPE_KEY}",
                showSecondaryValues: true,
                items: aIdCodeTypesListItem,
              }),

              // ID Code
              new Label({
                text: "ID Code",
                required: true,
              }),
              new Input({
                value: "{ZIDENTCODE_KEY}",
              }),
              // Main ID Code
              new Label({
                text: "Main ID Code",
              }),

              new Select({
                selectedKey: "{XMAINIDCODE}",
                items: [
                  new Item({ key: "", text: "" }),
                  new Item({ key: "X", text: "X" }),
                ],
              }),

              // Description
              new Label({
                text: "Description",
              }),
              new TextArea({
                value: "{BEZEICHNUNG}",
              }),
            ],
          });

          // set model
          oCodeTypeForm.setModel(_oCodeTypePopoverODataModel);

          // modify dialog
          const oModifyDialog = new Dialog({
            title: "Other ID Codes", // modifyed according to the action
            content: oCodeTypeForm,
            beginButton: new Button({
              text: "Close",
              press: () => {
                if (oModifyDialog.getTitle() === "Edit ID Code") {
                  // no action performed
                } else {
                  // delete created entry
                  _oCodeTypePopoverODataModel.resetChanges();
                }

                // close the dialog
                oModifyDialog.close();
              },
            }),
            endButton: new Button({
              text: "Save",
              type: "Emphasized",
              press: () => {
                // set busy indicator
                oModifyDialog.setBusy(true);

                // create scenario
                // update ZIDCODETYPE value with ISMIDCODETYPE_KEY
                if (oModifyDialog.getTitle() !== "Edit ID Code") {
                  const oBindingContext = oCodeTypeForm.getBindingContext();
                  const sPath = oBindingContext.getPath();
                  const oData = oBindingContext.getObject();
                  _oCodeTypePopoverODataModel.setProperty(
                    `${sPath}/ZIDCODETYPE`,
                    oData.ISMIDCODETYPE_KEY
                  );
                  _oCodeTypePopoverODataModel.setProperty(
                    `${sPath}/ZIDENTCODE`,
                    oData.ZIDENTCODE_KEY
                  );
                }

                // save the changes
                _oCodeTypePopoverODataModel.submitChanges({
                  success: (oData) => {
                    const oBatchResponse = oData.__batchResponses[0];

                    try {
                      if (oBatchResponse.response.statusCode >= 400) {
                        //Error
                        const sMessage = JSON.parse(
                          oBatchResponse.response.body
                        ).error.message.value;

                        MessageBox.error(sMessage, {
                          actions: [MessageBox.Action.CLOSE],
                          emphasizedAction: "Manage Products",
                          styleClass: _bCompact ? "sapUiSizeCompact" : "",
                          onClose: (sAction) => {
                            if (sAction !== MessageBox.Action.CLOSE) {
                              return;
                            }

                            // handle on close if requried
                          },
                        });
                      } else {
                        // success message
                        MessageToast.show("ID Code Created");

                        // refresh object page data
                        _oView.getModel().refresh();

                        // close the dialog
                        oModifyDialog.close();
                      }
                    } catch (err) {
                      // edit scenario
                      if (oModifyDialog.getTitle() === "Edit ID Code") {
                        let bSuccess =
                          parseInt(
                            oBatchResponse.__changeResponses[0].statusCode
                          ) === 204;

                        if (!bSuccess) {
                          // success message
                          MessageToast.show("Error in updating ID Code");
                          return;
                        }

                        // success message
                        MessageToast.show("ID Code updated successfully");

                        // remove all selections
                        _oCodeTypeTable.removeSelections();

                        // refresh object page data
                        _oView.getModel().refresh();

                        // close the dialog
                        oModifyDialog.close();
                      }

                      // create scenario
                      else {
                        let bSuccess =
                          parseInt(
                            oBatchResponse.__changeResponses[0].statusCode
                          ) === 201;

                        if (!bSuccess) {
                          // success message
                          MessageToast.show("Error in creating ID Code");
                          return;
                        }

                        // success message
                        MessageToast.show("ID Code created successfully");

                        // refresh object page data
                        _oView.getModel().refresh();

                        // close the dialog
                        oModifyDialog.close();
                      }
                    }

                    // set busy indicator
                    oModifyDialog.setBusy(false);
                  },
                  error: (_oErrorResponse) => {
                    // set busy indicator
                    oModifyDialog.setBusy(false);
                  },
                });
              },
            }),
          });

          // to get access to the controller's model
          _oView.addDependent(oModifyDialog);

          // create add button
          const oAddBtn = new Button({
            text: "Add",
            type: "Emphasized",
            visible: "{ui>/editable}",
            press: () => {
              // create a dialog for new id codetype

              // get material details on every add press
              let sSubtitle = _oView
                .getContent()[0]
                .getHeaderTitle()
                .getObjectSubtitle();
              let sProductNew = _oRowData.Product || sSubtitle;

              // generate uuid
              const uuidv4 = () => {
                return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(
                  /[018]/g,
                  (c) =>
                    (
                      c ^
                      (crypto.getRandomValues(new Uint8Array(1))[0] &
                        (15 >> (c / 4)))
                    ).toString(16)
                );
              };

              // odata properties
              const properties = {
                SAP_UUID: uuidv4(),
                MATNR: sProductNew.padStart(18, "0"),
                ISMIDCODETYPE_KEY: "",
                ZIDCODETYPE: "",
                ZIDENTCODE: "",
                XMAINIDCODE: "",
                BEZEICHNUNG: "",
                SAP_Description: "",
                SAP_CreatedDateTime: new Date(),
                SAP_CreatedByUser: "",
                SAP_CreatedByUser_Text: "",
                SAP_LastChangedDateTime: new Date(),
                SAP_LastChangedByUser: "",
                SAP_LastChangedByUser_Text: "",
                material_external: _oRowData.ProductExternalID || sProductNew,
              };

              // dialog set binding context
              const oBindingContext = _oCodeTypePopoverODataModel.createEntry(
                "/ZZ1_PTP_ZIDCODETYPE",
                { properties }
              );

              // set binding context to form
              oCodeTypeForm.setBindingContext(oBindingContext);

              // id code type enable on create mode
              sap.ui.getCore().byId("idCodeType-CodeTypeForm").setEnabled(true);

              // set title
              oModifyDialog.setTitle("New ID Code");

              // open dialog
              oModifyDialog.open();
            },
          });

          // create edit button
          const oEditBtn = new Button({
            text: "Edit",
            visible: "{ui>/editable}",
            press: () => {
              // get selected items
              const aSelectedItems = _oCodeTypeTable.getSelectedItems();

              if (aSelectedItems.length === 0) {
                // selected one row to edit
                MessageToast.show("Select atleast one row to edit!");

                // exit
                return;
              } else if (aSelectedItems.length > 1) {
                // selected only one row to edit
                MessageToast.show("Select only one row to edit!");

                // exit
                return;
              }

              // id code type disabled on edit mode
              sap.ui
                .getCore()
                .byId("idCodeType-CodeTypeForm")
                .setEnabled(false);

              // dialog set binding context
              const oBindingContext = aSelectedItems[0].getBindingContext();

              // set binding context to form
              oCodeTypeForm.setBindingContext(oBindingContext);

              // set title
              oModifyDialog.setTitle("Edit ID Code");

              // open dialog
              oModifyDialog.open();
            },
          });

          // create edit button
          const oDeleteBtn = new Button({
            text: "Delete",
            visible: "{ui>/editable}",
            press: () => {
              // check any row is selected before deletion
              // get selected items
              const aSelectedItems = _oCodeTypeTable.getSelectedItems();

              if (aSelectedItems.length === 0) {
                // selected one row to edit
                MessageToast.show("Select atleast one row to delete!");

                // exit
                return;
              }

              MessageBox.confirm(
                "Are you sure, you want to delete selected item?",
                {
                  actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                  emphasizedAction: MessageBox.Action.OK,
                  styleClass: _bCompact ? "sapUiSizeCompact" : "",
                  onClose: (sAction) => {
                    if (sAction !== MessageBox.Action.OK) {
                      return;
                    }

                    // set busy status
                    _oCodeTypeDialog.setBusy(true);

                    // get selected items
                    const aSelectedItems = _oCodeTypeTable.getSelectedItems();

                    // odata delete call
                    for (const oItem of aSelectedItems) {
                      // get selected item binding context
                      const oBindingContext = oItem.getBindingContext();

                      // set batch process for deletion of rows
                      _oCodeTypePopoverODataModel.remove(
                        oBindingContext.getPath(),
                        {
                          groupId: _sGroupId,
                        }
                      );
                    }

                    // save the batch changes
                    _oCodeTypePopoverODataModel.submitChanges({
                      groupId: _sGroupId,
                      success: () => {
                        // success message box
                        MessageBox.success("Deleted Successfully", {
                          styleClass: _bCompact ? "sapUiSizeCompact" : "",
                        });

                        // set busy status
                        _oCodeTypeDialog.setBusy(false);

                        // remove all selections
                        _oCodeTypeTable.removeSelections();
                      },
                      error: (oErrorResponse) => {
                        // error message box
                        MessageBox.error("Error in deletion", {
                          details: oErrorResponse.toString(),
                          styleClass: _bCompact ? "sapUiSizeCompact" : "",
                        });

                        // set busy status
                        _oCodeTypeDialog.setBusy(false);
                      },
                    });
                  },
                }
              );
            },
          });

          // title
          const oTitle = new Title({
            text: "Code Type",
          });

          // table header
          const oTableHeader = new OverflowToolbar({
            content: [
              oTitle,
              new ToolbarSpacer(),
              oAddBtn,
              oEditBtn,
              oDeleteBtn,
            ],
          });

          // table columns
          const aColumns = [
            new Column({
              header: new Label({
                text: "ID Code Type",
              }),
            }),
            new Column({
              header: new Label({
                text: "ID Code",
              }),
              minScreenWidth: "Desktop",
              popinDisplay: "Inline",
              demandPopin: true,
            }),
            new Column({
              header: new Label({
                text: "Main ID Code",
              }),
              minScreenWidth: "Desktop",
              popinDisplay: "Inline",
              demandPopin: true,
            }),
            new Column({
              header: new Label({
                text: "Description",
              }),
              minScreenWidth: "Desktop",
              popinDisplay: "Inline",
              demandPopin: true,
            }),
          ];

          // responsive table
          _oCodeTypeTable = new Table({
            ariaLabelledBy: [oTableHeader.getContent()[0]],
            growing: true,
            growingThreshold: 20,
            growingScrollToLoad: true,
            headerToolbar: oTableHeader,
            mode: "MultiSelect",
            columns: aColumns,
            updateFinished: (_updateFinishedEvent) =>
              oTitle.setText(
                `Code Types - (${_updateFinishedEvent.getParameter("total")})`
              ),
          });

          // set model
          _oCodeTypeTable.setModel(_oCodeTypePopoverODataModel);

          _oCodeTypeDialog = new Dialog({
            title: "Available Other ID Codes",
            content: _oCodeTypeTable,
            endButton: new Button({
              text: "Close",
              press: () => _oCodeTypeDialog.close(),
            }),
          });

          // to get access to the controller's model
          _oView.addDependent(_oCodeTypeDialog);

          // set style class
          _oCodeTypeDialog.addStyleClass("sapUiSizeCompact");
        }

        // table template
        const oTemplate = new ColumnListItem({
          vAlign: "Middle",
          type: "Inactive",
          cells: [
            new Text({
              text: "{ISMIDCODETYPE_KEY}",
              wrapping: false,
            }),
            new Text({
              text: "{ZIDENTCODE}",
              wrapping: false,
            }),
            new Text({
              text: "{XMAINIDCODE}",
              wrapping: false,
            }),
            new Text({
              text: "{BEZEICHNUNG}",
              wrapping: false,
            }),
          ],
        });

        // filter
        const aFilter = [
          new Filter({
            path: "material_external",
            operator: FilterOperator.EQ,
            value1: oData.ProductExternalID || sProduct,
          }),
        ];

        // table binding
        _oCodeTypeTable.bindItems({
          path: "/ZZ1_PTP_ZIDCODETYPE",
          filters: aFilter,
          template: oTemplate,
        });

        // open dialog
        _oCodeTypeDialog.open();
      },

      getResourceBundle: function () {
        let rBundle;
        try {
          rBundle = _oView
            .getController()
            .getOwnerComponent()
            .getModel("i18n")
            .getResourceBundle();
        } catch (error) {
          Log.error(`Failed to get resourcebundle - ${error}`);
        }
        return rBundle;
      },

      handleTabVisibility: async function (sTabName, sMaterialType) {
        if (!sMaterialType) {
          return true;
        }
        const aAllMaterialTypeList = await this._loadMaterialTypes();
        const aResult = aAllMaterialTypeList
          .map((obj) =>
            obj.tabName === sTabName && !obj.isVisible ? obj.materialType : ""
          )
          .filter((val) => val !== "")
          .filter((val) => sMaterialType === val);

        return aResult.length !== 0;
      },

      handleQtyValue: function (oEvent) {
        const oSource = oEvent.getSource();
        const sExistingValue = oEvent.getParameter("value");

        if(sExistingValue === "") {
          oSource.setValue("0.000");
        }
      }, 

      /***********************************************************************/
      /*                          INTERNAL METHODS                           */
      /***********************************************************************/

      _loadMaterialTypes: function () {
        return new Promise((resolve, reject) => {
          // material type not loaded
          if (_bMaterialTypeLoaded) {
            resolve(_aMaterialTypesList);
          } else {
            // set material type loaded flag to true
            _bMaterialTypeLoaded = true;

            _oView
              .getModel("customer.materialType")
              .read("/zptp_c_mtype_restrict", {
                success: (oData) => {
                  // format to required format
                  _aMaterialTypesList = oData.results.map((obj) => {
                    let response = {};
                    response.isVisible = obj.IsInvisible !== "X";
                    response.materialType =
                      obj.materialtypetabname.split("_")[0];
                    response.tabName = obj.materialtypetabname.split("_")[1];
                    return response;
                  });

                  resolve(_aMaterialTypesList);
                },
                error: (oError) => {
                  Log.error(
                    `Failed to load material types from service - ZPTP_C_MTYPE_RESTRICT_CDS - ${oError}`
                  );
                  reject();
                },
              });
          }
        });
      },

      _loadIdCodeTypes: function () {
        return new Promise((resolve, reject) => {
          _oView.getModel().read("/ZZ1_IDCodeTypeSet", {
            success: (oData) => {
              resolve(oData.results || []);
            },
            error: (oError) => {
              Log.error(
                `Failed to load id code types from service - MD_C_PRODUCT_MAINTAIN_SRV - ${oError}`
              );
              reject();
            },
          });
        });
      },

      _loadSmartFieldDescription: function (sSmartFieldId, sDescriptionPath) {
        try {
          const bEditable = _oView.getModel("ui").getProperty("/editable");
          // no description while editing
          if (bEditable) return;

          // instance
          const _oThis = this;
          const sViewId = _oView.getId();
          const oSubject = sap.ui
            .getCore()
            .byId(`${sViewId}--${_sCustomerNamespace}.${sSmartFieldId}`);

          if (!oSubject) {
            return;
          }

          // add event delegate
          oSubject.addEventDelegate({
            onAfterRendering: async (oRenderer) => {
              try {
                const oSource = oRenderer.srcControl;
                const oSourceDom = oSource.$();
                const oDataResponse = oSource.getBindingContext().getObject();
                let sDescription;

                // get description from odata response
                sDescription = oDataResponse && oDataResponse[sDescriptionPath];

                // get lead time indicator description from odata service
                if (sDescriptionPath === "LeadTimeIndicatorDescription") {
                  // check for lead time indicator profile value
                  const oResponse = await _oThis._getPlantDescription(
                    oDataResponse.Plant || "",
                    oDataResponse.LeadTimeIndicatorProfile || ""
                  );

                  sDescription = oResponse.LeadTimeIndicatorDescription || "";
                }

                // if description not found exit
                if (sDescription) {
                  // apply css to smart field source
                  oSourceDom.css({
                    display: "grid",
                    gap: "0.5rem",
                    "grid-template-columns": bEditable
                      ? "3fr auto"
                      : "auto 3fr",
                  });
                  // new description dom
                  const oDescription = $(
                    `<div style='align-self: center; font-size: 0.875rem;'>(${sDescription})</div>`
                  );
                  // insert element async
                  setTimeout(() => oSourceDom.append(oDescription), 100);
                }
              } catch (error) {
                // not a valid field description
              }
            },
          });
        } catch (error) {
          // unable to find requested dom
          Log.error(`Failed to load field for description - ${error}`);
        }
      },

      _setLabelsForSelectBox: function (sSelectBoxId, sLabel) {
        try {
          const sViewId = _oView.getId();
          const oSelectBox = sap.ui
            .getCore()
            .byId(`${sViewId}--${_sCustomerNamespace}.${sSelectBoxId}`);

          if (!oSelectBox) {
            return;
          }

          const aUOMFields = [
            "idSubSectionField19-1", // Extent
            "idSubSectionField23-1", // Feature1 Quantity with UOM
            "idSubSectionField25-1", // Unit for Feature2 Quantity
            "idSubSectionField26-1", // Dimensions-Length Format
            "idSubSectionField27-1", // Width-Length Format
            "idSubSectionField28-1", // Thickness Format
            "idSubSectionField29-1", // Paper/Page of weights - Weight of paper
            "idSubSectionField30-1", // Paper/Page of weights - Leaf Weight
            "idSubSectionField31-1", // Paper/Page of weights - Paper wt common part
            "idSubSectionField32-1", // Paper/Page of weights - LWt Common part
          ];

          // instance
          //   const _oThis = this;

          const onAfterRendering = () => {
            // add custom selection for plant
            // if (sSelectBoxId === "idSubSectionFieldP01-1") {
            //   // attach event on press
            //   this._plantTableFilter(oSelectBox);
            // }

            var oGroupElement = oSelectBox.$().parent().parent();
            var aChildren = oGroupElement.children();
            sap.ui
              .getCore()
              .byId(aChildren[0].firstElementChild.id)
              .setText(sLabel);

            // add uom dropdown
            const aFilter =
              aUOMFields.find((val) => val === sSelectBoxId) || [];

            if (aFilter.length !== 0) {
              try {
                let iLeftSize = 8;
                let iRightSize = 4;

                // input
                aChildren[1].classList.replace(
                  "sapUiFormCLCellsS6",
                  `sapUiFormCLCellsS${iLeftSize}`
                );
                aChildren[1].classList.replace(
                  "sapUiFormCLCellsL6",
                  `sapUiFormCLCellsL${iLeftSize}`
                );

                // Unit of measure
                aChildren[2].classList.replace(
                  "sapUiFormCLCellsS6",
                  `sapUiFormCLCellsS${iRightSize}`
                );
                aChildren[2].classList.replace(
                  "sapUiFormCLCellsL6",
                  `sapUiFormCLCellsL${iRightSize}`
                );
              } catch (error) {
                // unable to find requested dom
                Log.error(`Failed to load dom replacement - ${error}`);
              }
            }
          };

          // update label in the dom and change the cell size to fit in
          oSelectBox.addEventDelegate({
            onAfterRendering,
          });
        } catch (error) {
          Log.error(
            `Failed to set label for selectbox: field - ${sSelectBoxId}, label - ${sLabel}, error - ${error}`
          );
        }
      },

      _plantTableFilter: function (oSelectBox, sPlant) {
        try {
          // plant id
          const sId = `${_oView.getId()}--com.sap.vocabularies.UI.v1.FieldGroup::PlantGeneralData::PlantForEdit::Field`;
          const oPlant = sap.ui.getCore().byId(sId);

          // exit if there is no plant
          if (!oPlant) return;

          // filter
          const fnFilter = (sPlantVal) => {
            // binding
            const oBinding = oSelectBox.getBinding("items");

            // filter
            const aFilter = [
              new Filter({
                path: "Plant",
                operator: FilterOperator.EQ,
                value1: sPlantVal || "",
              }),
            ];

            // plant filter
            oBinding.filter(aFilter);
          };

          // not editable
          if (oPlant.getEditable()) {
            // if change event is already available exit
            if (oPlant.mEventRegistry.change) return;

            // lead time indicator filter
            const fnPlantFilter = (oEvent) => {
              const sPlantVal = oEvent.getSource().getValue();

              // filter by plant value
              fnFilter(sPlantVal);
            };

            // attach event change for the plant field
            oPlant.attachEvent("change", fnPlantFilter);

            // initial filter on editable
            fnPlantFilter("");
          } else {
            // filter by plant value
            fnFilter(sPlant);
          }
        } catch (error) {
          // handler not implemented
          debugger;
        }
      },

      _getPlantDescription: (sPlant, sLeadTimeIndicator) =>
        new Promise((resolve, reject) => {
          if (
            sPlant === undefined ||
            sPlant === "" ||
            sLeadTimeIndicator === undefined ||
            sLeadTimeIndicator === ""
          )
            reject();

          const success = (oData) => {
            resolve(oData);
          };

          const error = (_) => {
            reject();
          };

          _oView
            .getModel("customer.leadTimeIndicator")
            .read(
              `/ZPTP_C_SUP_AREA_VH(Plant='${sPlant}',LeadTimeIndicatorProfile='${sLeadTimeIndicator}')`,
              { success, error }
            );
        }),

      _loadStatusRestrict: function () {
        return new Promise((resolve, reject) => {
          if (_aStatusRestrict.length !== 0) {
            resolve(_aStatusRestrict);
          } else {
            _oView
              .getModel("customer.statusRestrict")
              .read("/ZOTC_C_MAT_STAT_RESTRICT", {
                success: (oData) => {
                  _aStatusRestrict = oData.results;
                  resolve(_aStatusRestrict);
                },
                error: (oError) => {
                  Log.error(
                    `Failed to load status restrict from service - ZOTC_C_MAT_STAT_RESTRICT_CDS - ${oError}`
                  );
                  reject();
                },
              });
          }
        });
      },

      _loadProductCompositionIndicator: function () {
        return new Promise((resolve, reject) => {
          if (_aProductCompositionIndicator.length !== 0) {
            resolve();
          } else {
            _oView
              .getModel("customer.ProductCompositionIndicator")
              .read("/ZPTP_C_RESP_EDITOR_VH", {
                success: (oData) => {
                  _aProductCompositionIndicator = oData.results;

                  // set model to view
                  _oView.setModel(
                    new JSONModel(_aProductCompositionIndicator),
                    "oProductCompositionIndicator"
                  );

                  resolve();
                },
                error: (oError) => {
                  Log.error(
                    `Failed to load status restrict from service - ZPTP_C_RESP_EDITOR_VH_CDS - ${oError}`
                  );
                  reject();
                },
              });
          }
        });
      },

      _loadLeadTimeIndicator: function (sPlant) {
        const mParameters = {
          success: (oData) => {
            // set data to model
            _oLeadTimeIndicatorModel.setData(oData.results);
          },
          error: (oError) => {
            Log.error(
              `Failed to load status restrict from service - ZPTP_C_SUP_AREA_VH - ${oError}`
            );
          },
        };

        // add filters if plant is available
        if (sPlant) {
          const aFilters = [
            new Filter({
              path: "Plant",
              operator: FilterOperator.EQ,
              value1: sPlant || "",
            }),
          ];

          mParameters.filters = aFilters;
        }

        _oView
          .getModel("customer.leadTimeIndicator")
          .read("/ZPTP_C_SUP_AREA_VH", mParameters);
      },

      _disChainFieldVisibility: function (aData) {
        try {
          const sId =
            "mdm.cmd.product.maintain::sap.suite.ui.generic.template.ObjectPage.view.Details::C_Productsalesdelivery";
          const sProductStatusId = `${sId}--com.sap.vocabularies.UI.v1.FieldGroup::SalesGeneralData::ProductSalesStatus::Field`;
          const oProductStatus = sap.ui.getCore().byId(sProductStatusId);

          if (oProductStatus) {
            const fnVisible = (sValue) => {
              let bEditable = false;
              let bMaterialStatus = false;
              let bMaterialType = false;
              // const oParms = oEvent.getParameters();

              if (sValue) {
                for (var i = 0, iLen = aData.length; i < iLen; i++) {
                  // validate material status
                  if (
                    aData[i].VariableName === "MATERIAL_STATUS" &&
                    aData[i].value === sValue
                  ) {
                    bMaterialStatus = true;
                  }

                  // validate material type
                  if (
                    aData[i].VariableName === "MATERIAL_TYPE" &&
                    aData[i].value === _oObjectData.ProductType
                  ) {
                    bMaterialType = true;
                  }
                }
              }

              // editable only on both condition satisfies material status and material type
              bEditable = bMaterialStatus && bMaterialType;

              // set to the view model
              _oCustomerViewModel.setProperty("/bEDUKStopAcc", bEditable);
              _oCustomerViewModel.setProperty("/bEDUKStopBill", bEditable);
            };

            // if change is already registered then exit
            if (!oProductStatus.mEventRegistry.hasOwnProperty("change")) {
              // attach change event for all the change in status value
              oProductStatus.attachEvent("change", (oEvent) => {
                fnVisible(oEvent.getSource().getValue());
              });
            }

            // product status from binding context
            const sStatus = oProductStatus
              .getBindingContext()
              .getObject().ProductSalesStatus;

            // handle initial visibility
            fnVisible(sStatus);
          }
        } catch (error) {
          Log.error(
            `Failed to handle field visibility for distribution chain based on product status, error - ${error}`
          );
        }
      },
    });
  }
);
