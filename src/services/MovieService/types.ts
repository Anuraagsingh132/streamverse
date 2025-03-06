import { RequestType } from "@/enums/request-type";
import { MediaType } from "@/types";

// Add the Similar request type to the RequestType enum
declare module "@/enums/request-type" {
  export enum RequestType {
    TRENDING = 1,
    TOP_RATED = 2,
    NETFLIX = 3,
    POPULAR = 4,
    GENRE = 5,
    SIMILAR = 6,
    KOREAN = 7,
  }
}
