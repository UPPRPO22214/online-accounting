type OwnRequestResult<Data = unknown, TError = unknown> = Promise<
  (
    | {
        data: Data;
        error: undefined;
      }
    | {
        data: undefined;
        error: TError;
      }
  ) & {
    request: Request;
    response: Response;
  }
>;

type DataExtractorWrapper = <D>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  promise: OwnRequestResult<D, any>,
) => Promise<D>;

export const dataExtractionWrapper: DataExtractorWrapper = (responsePromise) =>
  responsePromise.then(({ data, error, response }) => {
    if (data) return data;
    if (typeof error.detail === 'string') throw new Error(error.detail);
    throw new Error(`${response.status}: ${response.statusText}`);
  });
