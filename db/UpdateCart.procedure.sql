DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `UpdateCart`(IN `_UserID` INT(11), IN `_ProductID` INT(11), IN `_Quantity` INT(10))
BEGIN
	DECLARE checkCount INT;
	SET checkCount = (SELECT COUNT(*)
 FROM cart WHERE UserID = _UserID AND ProductID = _ProductID);
   
   CASE
	WHEN _Quantity <= 0 THEN DELETE FROM cart WHERE UserID = _UserID AND ProductID = _ProductID;
	ELSE UPDATE cart SET Quantity = _Quantity WHERE UserID = _UserID AND ProductID = _ProductID;
    UPDATE cart INNER JOIN product on product.ProductID = cart.ProductID SET cart.Total = product.Price * cart.Quantity where cart.UserID = _UserID AND cart.ProductID = _ProductID;
    end case;
   
END$$
DELIMITER ;