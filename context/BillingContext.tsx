import { ApiResponse, Bill, BillItem, Category, MenuItem } from "@/types";
import React, { createContext, ReactNode, use, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { APIEndpoints } from "@/constants/apiEndpoint";
import {useApiProducts} from '@/hooks/use-api-products'
import {useApiCategories} from '@/hooks/use-api-category'


interface BillingContextType {
  menuItems: MenuItem[];
  categoryItems: Category[];
  billItems: BillItem[];
  currentBill: Bill | null;
  addToBill: (item: MenuItem) => void;
  removeFromBill: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearBill: () => void;
  calculateTotal: () => { subtotal: number; tax: number; total: number };
  addMenuItem: (item: Omit<MenuItem, "id">) => void;
  updateMenuItem: (id: string, item: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
}

const BillingContext = createContext<BillingContextType | undefined>(undefined);

// Sample menu items for a cafe
// const initialMenuItems: MenuItem[] = [
//   {
//     id: "1",
//     name: "Espresso",
//     price: 120,
//     category: "Coffee",
//     description: "Strong and bold espresso shot",
//     isAvailable: true,
//     image: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=200",
//   },
//   {
//     id: "2",
//     name: "Cappuccino",
//     price: 180,
//     category: "Coffee",
//     description: "Creamy cappuccino with foam art",
//     isAvailable: true,
//     image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=200",
//   },
//   {
//     id: "3",
//     name: "Latte",
//     price: 200,
//     category: "Coffee",
//     description: "Smooth and milky latte",
//     isAvailable: true,
//     image: "https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=200",
//   },
//   {
//     id: "4",
//     name: "Cold Brew",
//     price: 220,
//     category: "Coffee",
//     description: "Refreshing cold brew coffee",
//     isAvailable: true,
//     image: "https://images.unsplash.com/photo-1517959105821-eaf2591984ca?w=200",
//   },
//   {
//     id: "5",
//     name: "Chocolate Muffin",
//     price: 150,
//     category: "Snacks",
//     description: "Rich chocolate muffin",
//     isAvailable: true,
//     image: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=200",
//   },
//   {
//     id: "6",
//     name: "Croissant",
//     price: 120,
//     category: "Snacks",
//     description: "Buttery flaky croissant",
//     isAvailable: true,
//     image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=200",
//   },
//   {
//     id: "7",
//     name: "Club Sandwich",
//     price: 280,
//     category: "Food",
//     description: "Triple-decker club sandwich",
//     isAvailable: true,
//     image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=200",
//   },
//   {
//     id: "8",
//     name: "Caesar Salad",
//     price: 250,
//     category: "Food",
//     description: "Fresh Caesar salad with croutons",
//     isAvailable: true,
//     image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=200",
//   },
// ];

export function BillingProvider({ children }: { children: ReactNode }) {
  const {currentBusiness, getToken, isAuthenticated} = useAuth();
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [currentBill, setCurrentBill] = useState<Bill | null>(null);


  // useEffect(() => {
  //   // Fetch menu items from API when current business changes
  //   const fetchMenuItems = async () => {
  //     if (!currentBusiness) return;
  //     try {
  //       const response = await fetch(
  //         `${APIEndpoints.baseURL}${APIEndpoints.products.list.replace(":tenantId", currentBusiness.id)}`,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${getToken()}`,
  //           },
  //         }
  //       );
  //       const data = await response.json() as ApiResponse;
  //       if (response.ok) {
  //         setMenuItems(data.data);
  //       } else {
  //         console.error("Failed to fetch menu items:", data.error);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching menu items:", error);
  //     }
  //   };
  //   fetchMenuItems();
  // }, [currentBusiness?.id]);

  // useEffect(() => {
  //   // Fetch category items from API
  //   const fetchCategoryItems = async () => {
  //     if (!currentBusiness) return;
  //     try {
  //       const response = await fetch(
  //         `${APIEndpoints.baseURL}/tenants/${currentBusiness.id}/categories`,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${getToken()}`,
  //           },
  //         }
  //       );
  //       const data = await response.json() as ApiResponse;
  //       if (response.ok) {
  //         setCategoryItems(data.data);
  //       } else {
  //         console.error("Failed to fetch category items:", data.error);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching category items:", error);
  //     }
  //   };
  //   fetchCategoryItems();
  // }, [currentBusiness?.id])

  // Use the hooks instead of fetch
  const { data: menuItems = [] } = useApiProducts({
    tenantId: currentBusiness?.id,
    enabled: (!!currentBusiness?.id && isAuthenticated),
  });

  const { data: categoryItems = [] } = useApiCategories({
    tenantId: currentBusiness?.id,
    enabled: (!!currentBusiness?.id && isAuthenticated),
  });

  const addToBill = (item: MenuItem) => {
    setBillItems((prev) => {
      const existingItem = prev.find((bi) => bi.menuItem.id === item.id);
      if (existingItem) {
        return prev.map((bi) =>
          bi.menuItem.id === item.id
            ? {
                ...bi,
                quantity: bi.quantity + 1,
                subtotal: (bi.quantity + 1) * bi.menuItem.price,
              }
            : bi,
        );
      }
      return [
        ...prev,
        {
          id: Date.now().toString(),
          menuItem: item,
          quantity: 1,
          subtotal: item.price,
        },
      ];
    });
  };

  const removeFromBill = (itemId: string) => {
    setBillItems((prev) => prev.filter((bi) => bi.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromBill(itemId);
      return;
    }
    setBillItems((prev) =>
      prev.map((bi) =>
        bi.id === itemId
          ? { ...bi, quantity, subtotal: quantity * bi.menuItem.price }
          : bi,
      ),
    );
  };

  const clearBill = () => {
    setBillItems([]);
    setCurrentBill(null);
  };

  const calculateTotal = () => {
    const subtotal = billItems.reduce((sum, bi) => sum + bi.subtotal, 0);
    const tax = subtotal * 0.05; // 5% tax
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  // const addMenuItem = async (item: Omit<MenuItem, "id">) => {
  //   // Add menu item to backend
  //   try {
  //     const response = await fetch(`${APIEndpoints.baseURL}${APIEndpoints.products.create.replace(":tenantId", currentBusiness?.id || "")}`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${getToken()}`,
  //       },
  //       body: JSON.stringify(item),
  //     });
  //     if (!response.ok) {
  //       console.error("Failed to add menu item to backend");
  //     }
  //     const responseData = await response.json() as ApiResponse;
  //     if (responseData.success) {
  //       setMenuItems((prev) => [...prev, responseData.data]);
  //     } else {
  //       console.error("Failed to add menu item:", responseData.error);
  //     }
  //   } catch (error) {
  //     console.error("Error adding menu item to backend:", error);
  //   }
  // };

  // const updateMenuItem = async (id: string, item: Partial<MenuItem>) => {

  //   try {
  //     // Update menu item in backend
  //     const response = await fetch(`${APIEndpoints.baseURL}${APIEndpoints.products.update.replace(":tenantId", currentBusiness?.id || "").replace(":productId", id)}`, {
  //       method: "PUT",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${getToken()}`,
  //       },
  //       body: JSON.stringify(item),
  //     })
  //     if (response.status !== 200) {
  //       console.error("Failed to update menu item");
  //       return;
  //     }
  //     // Update menu item in local state
  //     setMenuItems((prev) =>
  //       prev.map((mi) => (mi.id === id ? { ...mi, ...item } : mi)),
  //     );
  //   } catch (error) {
  //     console.error("Error updating menu item:", error);
  //   }
  // };

  // const deleteMenuItem = async (id: string) => {

  //   try {
  //     // Delete menu item from backend
  //     const response = await fetch(`${APIEndpoints.baseURL}${APIEndpoints.products.delete.replace(":tenantId", currentBusiness?.id || "").replace(":productId", id)}`, {
  //       method: "DELETE",
  //       headers: {
  //         Authorization: `Bearer ${getToken()}`,
  //       },
  //     });
  //     if (response.status !== 200) {
  //       console.error("Failed to delete menu item");
  //     }
  //     setMenuItems((prev) => prev.filter((mi) => mi.id !== id));
  //   } catch (error) {
  //     console.error("Error deleting menu item:", error);
  //   }

  // };
  const addMenuItem = (item: Omit<MenuItem, "id">) => {
    // This is now handled by useCreateProduct hook in the component
  };

  const updateMenuItem = (id: string, item: Partial<MenuItem>) => {
    // This is now handled by useUpdateProduct hook in the component
  };

  const deleteMenuItem = (id: string) => {
    // This is now handled by useDeleteProduct hook in the component
  };
  return (
    <BillingContext.Provider
      value={{
        menuItems,
        billItems,
        currentBill,
        addToBill,
        removeFromBill,
        updateQuantity,
        clearBill,
        calculateTotal,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        categoryItems
      }}
    >
      {children}
    </BillingContext.Provider>
  );
}

export function useBilling() {
  const context = useContext(BillingContext);
  if (context === undefined) {
    throw new Error("useBilling must be used within a BillingProvider");
  }
  return context;
}
