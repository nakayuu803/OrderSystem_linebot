import mongoose from 'mongoose';
import StoreOrderSchema from '../../../models/StoreOrder';
import StoreOrder from '../../../models/StoreOrder'
import OrderData from '../../../models/OrderData';    // OrderData モデルをインポート
import ProductData from '../../../models/ProductData';    // OrderData モデルをインポート
import StoreData from '../../../models/StoreData'
import connectToDatabase from '../../../lib/mongoose';

export async function getUpdateOrderData(storeOrder) {
    try {
      await connectToDatabase();
      let StoreOrder;
    if (mongoose.modelNames().includes("demostore_orders")) {
      StoreOrder = mongoose.model("demostore_orders");
    } else {
      StoreOrder = mongoose.model("demostore_orders", StoreOrderSchema);
    }
      console.log("storeOrderIDだよ:", storeOrder._id);
  
      // orderIdのpopulateを手動で実装
      const orderData = await OrderData.findById(storeOrder.orderId)
        .select('clientName lineUserId')
        .exec();
      
      // orderListの各itemのproductIdとstoreIdのpopulateを手動で実装
      const populatedOrderList = await Promise.all(
        storeOrder.orderList.map(async (orderItem) => {
          const productData = await ProductData.findById(orderItem.productId)
            .select('productName productImageUrl')
            .exec();
  
          const storeData = await StoreData.findById(orderItem.storeId)
            .select('storeName')
            .exec();
  
          return {
            productName: productData?.productName || 'Unknown Product',
            productImageUrl: productData?.productImageUrl || '',
            orderQuantity: orderItem.orderQuantity,
            storeId: orderItem.storeId.toString(),
            storeName: storeData?.storeName || 'Unknown Store',
          };
        })
      );
  
      const formattedOrder = {
        lineUserId: orderData?.lineUserId || 'Unknown User',
        clientName: orderData?.clientName || 'Unknown Client',
        orderList: populatedOrderList,
      };
  
      console.log("中身だよ:", formattedOrder);
  
      return {
        success: true,
        orderDetails: formattedOrder,
      };
    } catch (error) {
      console.error('Error:', error.message);
      return { success: false, message: 'エラーが発生しました' };
    }
  }
  