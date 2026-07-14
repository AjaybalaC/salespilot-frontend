export async function apiHandler<T>(
  apiCall: Promise<{ data: T }>
): Promise<T> {
  try {
    const response = await apiCall;
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Something went wrong."
    );
  }
}