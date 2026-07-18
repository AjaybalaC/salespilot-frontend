import api from "@/lib/api";
import { CustomerPayload } from "@/types/customer.types";

export const getCustomers = async (
  page = 1,
  limit = 10,
  search = ""
) => {
  const response = await api.get("/customer", {
    params: {
      page,
      limit,
      search,
    },
  });

  return response.data;
};

export const getCustomerById = async (
  id: string
) => {
  const response = await api.get(`/customer/${id}`);

  return response.data;
};

export const createCustomer = async (
  payload: CustomerPayload
) => {
  const response = await api.post(
    "/customer",
    payload
  );

  return response.data;
};

export const updateCustomer = async (
  id: string,
  payload: CustomerPayload
) => {
  const response = await api.put(
    `/customer/${id}`,
    payload
  );

  return response.data;
};

export const deleteCustomer = async (
  id: string
) => {
  const response = await api.delete(
    `/customer/${id}`
  );

  return response.data;
};