import { AxiosError } from "axios";
import { useMutation, UseMutationOptions, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { useJazzContext } from "@/components/content/useJazzContext.ts";

export function useJazzMutation<InstanceType extends { url?: string }>({
  saveFunction,
  queryKey,
  successMessage,
}: {
  saveFunction: (obj: InstanceType) => Promise<InstanceType>;
  queryKey: string;
  successMessage: string;
}) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { url } = useParams();
  const { showSuccess, showError } = useJazzContext();
  const [search] = useSearchParams();

  function reloadAndSetResult(data: InstanceType) {
    if (url !== data.url) {
      navigate({ pathname: `/${queryKey}/${data.url}`, search: `page=${search.get("page")}` }, { replace: true });
    }
  }

  const result: UseMutationOptions<InstanceType, AxiosError<unknown, InstanceType>, InstanceType, unknown> = {
    mutationFn: (obj) => {
      return saveFunction(obj);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      reloadAndSetResult(data);
      showSuccess({ text: successMessage });
    },
    onError: (error) => {
      if (error?.response?.data) {
        showError({ text: (error?.response?.data as string) + "\nSeite wird neu geladen", closeCallback: () => location.reload() });
      }
    },
  };
  return useMutation(result);
}
