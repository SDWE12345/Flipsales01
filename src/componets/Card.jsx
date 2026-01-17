"use client";

import Link from "next/link";

export default function Card({ item }) {
  // Smart data extraction
  const sellingPrice = item.selling_price || item.price || 0;
  const mrp = item.mrp || 0;
  const percentageOff =
    mrp > sellingPrice ? ((mrp - sellingPrice) / mrp) * 100 : 0;

  // Get best available image
  const getImageUrl = () => {
    if (item.images0) return item.images0;
    if (item.image) return item.image;
    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      return item.images[0];
    }
    return "/placeholder.jpg";
  };

  const imageUrl = getImageUrl();

  // Get and format title
  const getTitle = () => {
    const rawTitle = item.Title || item.title || "Product";
    // Clean up overly long titles
    if (rawTitle.length > 50) {
      return rawTitle.substring(0, 50) + "...";
    }
    return rawTitle;
  };

  const displayTitle = getTitle();
  const productId = item._id || item.id || Date.now();

  const handleClick = () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("d1", JSON.stringify(item));
      } catch (error) {
        console.error("Error saving to localStorage:", error);
      }
    }
  };

  return (
    <Link
      href={`/product-details/${productId}`}
      onClick={handleClick}
      style={{
        textDecoration: "none",
        display: "block",
        width: "50%",
        padding: "0",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          background: "#fff",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          border: "1px solid #ccc",
          transition: "all 0.3s ease",
          position: "relative",
          overflow: "hidden",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.12)";
          e.currentTarget.style.transform = "translateY(-4px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "none";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        {/* Top Section with Discount Banner */}
        <div
          style={{
            padding: "10px 12px",
            borderBottom: "1px solid #f0f0f0",
            minHeight: "42px",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "6px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {percentageOff > 0 && (
                <>
                  <span
                    style={{
                      color: "#388e3c",
                      fontWeight: "600",
                    }}
                  >
                    {percentageOff.toFixed(0)}% Off
                  </span>
                  <span
                    style={{
                      color: "#878787",
                      textDecoration: "line-through",
                      fontSize: "12px",
                    }}
                  >
                    ₹{mrp.toLocaleString("en-IN")}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Product Image Container */}
        <div
          style={{
            width: "100%",
            paddingTop: "100%",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Discount Badge Overlay */}
          {percentageOff >= 96 && (
            <div
              style={{
                position: "absolute",
                top: "12px",
                left: "12px",
                background: "#ff5722",
                color: "#fff",
                padding: "6px 10px",
                fontSize: "12px",
                fontWeight: "700",
                borderRadius: "3px",
                zIndex: 2,
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              }}
            >
              HOT DEAL
            </div>
          )}

          <img
            src={imageUrl}
            alt={displayTitle}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              maxWidth: "85%",
              maxHeight: "85%",
              objectFit: "contain",
              transition: "transform 0.3s ease",
            }}
            loading="lazy"
            onError={(e) => {
              e.target.src = "/placeholder.jpg";
              e.target.style.opacity = "0.5";
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translate(-50%, -50%) scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translate(-50%, -50%) scale(1)";
            }}
          />
        </div>

        {/* Product Info Section */}
        <div
          style={{
            padding: "14px 12px 12px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            flex: 1,
            borderTop: "1px solid #f0f0f0",
          }}
        >
          {/* Product Title */}
          <div
            style={{
              fontSize: "14px",
              fontWeight: "500",
              color: "#212121",
              lineHeight: "1.4",
              minHeight: "40px",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              marginBottom: "4px",
            }}
          >
            {displayTitle}
          </div>

          {/* Price Section */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "6px",
              marginBottom: "6px",
            }}
          >
            <span
              style={{
                fontSize: "20px",
                fontWeight: "600",
                color: "#212121",
              }}
            >
              ₹{sellingPrice.toLocaleString("en-IN")}
            </span>
            {mrp > sellingPrice && (
              <span
                style={{
                  fontSize: "14px",
                  color: "#878787",
                  textDecoration: "line-through",
                }}
              >
                ₹{mrp.toLocaleString("en-IN")}
              </span>
            )}
          </div>
          <div className="d-flex" style={{justifyContent:'space-between'}}>
            {/* Rating Section */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginBottom: "8px",
              }}
            >
              <div
                style={{
                  background: "#388e3c",
                  color: "#fff",
                  padding: "4px 8px",
                  borderRadius: "3px",
                  fontSize: "12px",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span>4.3</span>
                <span>★</span>
              </div>
              <span
                style={{
                  fontSize: "12px",
                  color: "#878787",
                }}
              >
                (120)
              </span>
            </div>

            {/* Flipkart Assured Badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <img
                src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/fa_62673a.png"
                alt="Flipkart Assured"
                style={{
                  height: "21px",
                  width: "auto",
                }}
              />
            </div>
          </div>
          {/* Limited Time Deal Button */}
          <button
            type="button"
            style={{
              width: "100%",
              padding: "6px 8px",
              background: "rgb(255, 194, 99)",
              color: "rgb(0, 0, 0)",
              border: "none",
              borderRadius: "3px",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              marginTop: "auto",
              transition: "all 0.3s ease",
              textAlign: "center",
              boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgb(255, 184, 79)";
              e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.15)";
              e.target.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgb(255, 194, 99)";
              e.target.style.boxShadow = "0 1px 2px rgba(0,0,0,0.1)";
              e.target.style.transform = "translateY(0)";
            }}
            onClick={(e) => e.preventDefault()}
          >
            Limited time deal
          </button>

          {/* Free Delivery Text */}
          <div
            style={{
              fontSize: "12px",
              color: "#388e3c",
              fontWeight: "500",
              textAlign: "left",
              marginTop: "6px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span style={{ fontSize: "14px" }}>✓</span>
            <span>Free Delivery in Two Days</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
