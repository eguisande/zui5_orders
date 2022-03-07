sap.ui.define([
	"zui5_orders/controller/BaseController",
	"sap/ui/core/routing/History",
	"sap/ui/model/Filter",
	"zui5_orders/utils/formatter",
	"sap/m/MessageBox"
], function(BaseController, History, Filter, formatter, MessageBox) {
	"use strict";

	return BaseController.extend("zui5_orders.apps.zui5_transferorder.controller.App", {
		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf zui5_orders.apps.zui5_transferorder.view.App
		 */
		onInit: function() {
			debugger;
			this.setVisibleNavBar();
			this.getDataService();
			debugger;
			this.getRouter().getRoute("transfer").attachPatternMatched(this._onRouteMatched, this);

		},

		_onRouteMatched: function() {

			this.getDataService();
		},

		onExit: function() {
            debugger;
		},

		onAfterRendering: function() {

		},

		getDataService: function() {
			var oTable = this.getView().byId("oTableItemsId");
			oTable.setBusyIndicatorDelay(0);
			oTable.setBusy(true);
			this.getOwnerComponent().getModel("mTrasCentral").read("/TrasladosSet", {
			    filters: [new Filter("Reswk", "EQ", "5109")],
				success: function(resp) {
					oTable.setBusy(false);
					this.getOwnerComponent().getModel("mTableTraslados").setData(resp.results);
				}.bind(this),
				error: function(err) {
					oTable.setBusy(false);
				}.bind(this)
			})
		},

		getSplitAppObj: function() {
			var result = this.byId("SplitApp");
			if (!result) {
				console.log("SplitApp object can't be found");
			}
			return result;
		},

		// MASTER PAGE 

		setVisibleNavBar: function() {
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			this.getOwnerComponent().getModel("device").setProperty("/isTablet", false);
			this.getOwnerComponent().getModel("device").setProperty("/isMobile", false);

			if (oDeviceModel.getProperty("/system").tablet) {
				this.getOwnerComponent().getModel("device").setProperty("/isTablet", true);
			} else if (oDeviceModel.getProperty("/system").phone) {
				this.getOwnerComponent().getModel("device").setProperty("/isMobile", true);
			}
		},

		onPressOrder: function(oEvent) {

			var oSelect = oEvent.getSource().getBindingContext("orders").getObject();

			this.getView().getModel("mDetail").setData(oSelect);

			var oSplitApp = this.getSplitAppObj();
			oSplitApp.toDetail(this.createId("detail"));

			this.setNavButton(true);
		},

		onHandleFilter: function(oEvent) {
			var sInput = oEvent.getSource().getValue();

			var aFilter = [];
			aFilter.push(new Filter("name", "Contains", sInput));

			var oList = this.getView().byId("listOrders");
			oList.getBinding("items").filter(aFilter);

		},

		setNavButton: function(isMaster) {
			if (this.getOwnerComponent().getModel("device").getProperty("/isMobile")) {
				if (isMaster) {
					this.getView().byId("SplitContainer").detachNavButtonPress(this.onNavBack, this);
					this.getView().byId("SplitContainer").attachNavButtonPress(this.onBackMaster, this);
				} else {
					this.getView().byId("SplitContainer").detachNavButtonPress(this.onBackMaster, this);
					this.getView().byId("SplitContainer").attachNavButtonPress(this.onNavBack, this);
				}
			}
		},

		// DETAIL PAGE

		onBackMaster: function() {
			this.getSplitAppObj().backDetail();
			this.setNavButton(false);
		},
		onSelectCheckB: function(oEvent) {
			var oSelected = oEvent.getSource().getBinding("selected").getContext().getObject();

			if (oEvent.getParameter("id").slice(5, 6) === '0') {
				if (oSelected.Rechaz && oSelected.Acepta) {
					oSelected.Rechaz = !oSelected.Acepta;
				}
			} else {
				if (oSelected.Rechaz && oSelected.Acepta) {
					oSelected.Acepta = !oSelected.Rechaz;
				}
			}

		},

		onConfirmar: async function() {
			this.getView().setBusy(true);
			var oData = this.getView().getModel("mTableTraslados").getData();
			oData = this._getDataValues(oData);
			var aSuccess = [];
			var aError = [];

			for (let item of oData) {
				try {
					var oResp = await this.createTraslados(item);
					aSuccess.push(item.Ebeln);
				} catch (err) {
					aError.push(item.Ebeln);
				}
			}
			this.showSuccesData(aSuccess);

			this.getDataService();
			this.getView().setBusy(false);

		},

		showSuccesData: function(aData) {
			var sText = "\n";
			for (let item of aData) {
				sText = sText + item + "\n";
			}
			MessageBox.success("Se han actualizado las siguientes ordenes: " + sText);
		},

		createTraslados: function(oData) {
			var oModel = this.getOwnerComponent().getModel("mTrasCentralR");
			return new Promise(function(resolve, rejected) {
				oModel.create("/POHeaderSet", oData, {
					success: resolve,
					error: rejected
				});
			});
		},

		_getDataValues: function(data) {
			var aData = [];
			for (let item of data) {
				if (item.Acepta || item.Rechaz) {
					if (item.Acepta) {

						item.Aceptar = "X"

					} else {
						item.Rechazar = "X"
					}

					aData.push({
						Ebeln: item.Ebeln,
						Aceptar: item.Aceptar,
						Rechazar: item.Rechazar,
						Vbeln: item.Vbeln,
						Posnr: item.Posnr,
						Status: ""
					});
				}
			}
			return aData;
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf zui5_orders.apps.zui5_transferorder.view.App
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf zui5_orders.apps.zui5_transferorder.view.App
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf zui5_orders.apps.zui5_transferorder.view.App
		 */
		//	onExit: function() {
		//
		//	}

	});

});