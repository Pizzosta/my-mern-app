/*
// Helper function to add virtuals to product data
const formatProductWithVirtuals = (product) => ({
  //...product,
  ...product.toObject ? product.toObject() : product,
  timeRemaining: product.timeRemaining
  //seller: product.sellerDetails || null,
  //winner: product.winnerDetails || null
});

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 })
    /*.populate({
        path: 'winnerDetails',
        select: 'username email' // Only include necessary fields
    })
    .populate({
        path: 'sellerDetails',
        select: 'username email'
    })
    .lean({ virtuals: true });// Convert to plain JS objects & include virtuals
*/
    const formattedProducts = products.map(product => ({
      //...product,
      ...product.toObject(),
      timeRemaining: product.timeRemaining,
      status: product.status
      // Remove manual timeRemaining assignment
      //seller: product.sellerDetails || null,
      //winner: product.winnerDetails || null
    }));

    res.status(200).json({ success: true, data: formattedProducts });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
*/

/*
                        const productsWithUsers = data.data.map(product => ({
                            ...product,
                            winner: product.winner ? {
                                id: product.winner._id,
                                username: product.winner.username
                            } : null,
                            seller: product.seller ? {
                                id: product.seller._id,
                                username: product.seller.username
                            } : null
                        }));
                        set({ products: productsWithUsers});
                        */