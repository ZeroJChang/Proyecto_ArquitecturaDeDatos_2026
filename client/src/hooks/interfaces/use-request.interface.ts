export interface UseRequestProps {
  url: string;
  method: 'get' | 'post' | 'put' | 'delete' | 'patch';
  body?: object;
  onSuccess?: (data: any) => void;
}
