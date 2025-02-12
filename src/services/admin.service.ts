import api from "@/lib/axios";
import { DashboardStatsResponse } from "@/types/admin.types";
import { Product, ProductResponse } from "@/types/product.types";
import { OrdersResponse, OrderResponse } from "@/types/order.types";
import { Order } from "@/types/order.types";

export const adminService = {
  async getDashboardStats(): Promise<DashboardStatsResponse> {
    try {
      const response = await api.get("/admin/dashboard/stats");
      return response.data;
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error;
    }
  },

  async getRecentOrders() {
    try {
      const response = await api.get("/admin/orders/recent");
      return response.data;
    } catch (error) {
      console.error("Error fetching recent orders:", error);
      throw error;
    }
  },

  async getTopProducts() {
    try {
      const response = await api.get("/admin/products/top");
      return response.data;
    } catch (error) {
      console.error("Error fetching top products:", error);
      throw error;
    }
  },

  async getPresignedUrls(files: File[]): Promise<string[]> {
    const fileData = files.map((file) => ({
      contentType: file.type,
    }));

    const response = await api.post(
      "https://api.atozaccessory.com/aws/get-presigned-url?type=octet-stream",
      {
        folder: "imageSlider",
        files: fileData,
      }
    );
    console.log(response);

    if (response.data.success) {
      // Extract the presigned URLs from the response
      console.log("Heloooooooo1");

      return response.data.data.preSignedURLs;
    } else {
      console.log("Heloooooooo2");
      throw new Error("Failed to get presigned URLs");
    }
  },

  async uploadImages(files: File[]): Promise<string[]> {
    try {
      const presignedUrls = await this.getPresignedUrls(files);
      if (!presignedUrls || presignedUrls.length === 0) {
        throw new Error("No presigned URLs returned");
      }

      const uploadPromises = files.map((file, index) => {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", file.type);
        myHeaders.append(
          "Cache-Control",
          "no-cache, no-store, must-revalidate"
        );
        myHeaders.append("Content-Disposition", "inline");

        const requestOptions = {
          method: "PUT",
          headers: myHeaders,
          body: file,
          redirect: "follow",
          mode: "cors", // Explicitly state CORS mode
          credentials: "omit",
        };
        return fetch(presignedUrls[index].preSignedURL, requestOptions);
      });

      await Promise.all(uploadPromises);
      return presignedUrls.map((objUrl) => objUrl.mediaUrl); // Return the presigned URLs after successful upload
    } catch (error) {
      console.error("Error uploading images:", error);
      throw error; // Rethrow the error for further handling
    }
  },

  async createProduct(productData: Product): Promise<ProductResponse> {
    try {
      const response = await api.post("/product/create", productData);
      return response.data;
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  },

  async updateProduct(
    productId: string,
    productData: Product
  ): Promise<ProductResponse> {
    try {
      const response = await api.patch(
        `/product/update/${productId}`,
        productData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  },

  async deleteProduct(productId: string): Promise<void> {
    try {
      await api.delete(`/product/delete/${productId}`);
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  },

  async getProducts(page: number = 1): Promise<ProductResponse> {
    try {
      const response = await api.get(
        `/public/product/get-all-product?page=${page}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  async deletePresignedUrl(fileName: string): Promise<void> {
    await api.delete(
      `http://localhost:5000/category/delete-presigned-url?fileName=${encodeURIComponent(
        fileName
      )}`
    );
  },

  async getOrders(): Promise<OrdersResponse> {
    try {
      const response = await api.get("/order/get-user-orders");
      return response.data;
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw error;
    }
  },

  async getOrderDetails(orderId: string): Promise<OrderResponse> {
    try {
      const response = await api.get(`/order/get-order/${orderId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching order details:", error);
      throw error;
    }
  },

  async updateOrderStatus(
    orderId: string,
    status: Order["status"]
  ): Promise<OrderResponse> {
    try {
      const response = await api.patch(`/order/update-status/${orderId}`, {
        status,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  },

  async getAllOrders(page: number = 1): Promise<OrdersResponse> {
    try {
      const response = await api.get(`/order/get-all-orders?page=${page}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching all orders:", error);
      throw error;
    }
  },

  async getOrdersByStatus(
    status: Order["status"],
    page: number = 1
  ): Promise<OrdersResponse> {
    try {
      const response = await api.get(
        `/order/get-orders-by-status/${status}?page=${page}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching orders by status:", error);
      throw error;
    }
  },
};
