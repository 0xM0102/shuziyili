package com.shuziyili.common;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

  private final boolean ok;
  private final String message;
  private final T data;

  private ApiResponse(boolean ok, String message, T data) {
    this.ok = ok;
    this.message = message;
    this.data = data;
  }

  public static <T> ApiResponse<T> success(T data) {
    return new ApiResponse<>(true, null, data);
  }

  public static ApiResponse<Void> success() {
    return new ApiResponse<>(true, null, null);
  }

  public static <T> ApiResponse<T> fail(String message) {
    return new ApiResponse<>(false, message, null);
  }

  public boolean isOk() {
    return ok;
  }

  public String getMessage() {
    return message;
  }

  public T getData() {
    return data;
  }
}
