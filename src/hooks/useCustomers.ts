import { useQuery } from "@tanstack/react-query";
import { getCustomers } from "@/services/customer.service";
import { useMutation } from "@tanstack/react-query";
import { createCustomer } from "@/services/customer.service";

export const useCustomers = (
  page: number,
  search: string
) => {
  return useQuery({
    queryKey: ["customers", page, search],

    queryFn: () =>
      getCustomers(page, 10, search),
  });
};

export const useCreateCustomer = () => {
  return useMutation({
    mutationFn: createCustomer,
  });
};