export function getErrorMessage(error: unknown, fallback = "Something went wrong.") {
  return (
    (error as any)?.response?.data?.errorMessages?.[0]?.message ||
    (error as any)?.response?.data?.message ||
    (error as Error)?.message ||
    fallback
  )
}
