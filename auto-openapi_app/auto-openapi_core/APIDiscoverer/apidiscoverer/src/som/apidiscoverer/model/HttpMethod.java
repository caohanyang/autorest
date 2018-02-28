package som.apidiscoverer.model;

public enum HttpMethod {

	GET("Get"), POST("Post"), PUT("Put"), DELETE("Delete"), PATCH("Patch");
	private String label;

	private HttpMethod(String label) {
		this.label = label.toLowerCase();
	}

	public String getLabel() {
		return label;
	}
	public static HttpMethod fromString(String text) {
	    if (text != null) {
	      for (HttpMethod b : HttpMethod.values()) {
	        if (text.equalsIgnoreCase(b.label)) {
	          return b;
	        }
	      }
	    }
	    return null;
	  }
}
