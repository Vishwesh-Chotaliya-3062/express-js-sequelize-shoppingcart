DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `AddToCart`(IN `_UserID` INT(11), IN `_ProductID` INT(11))
BEGIN
	DECLARE checkCount INT;
	SET checkCount = (SELECT COUNT(*)
 FROM cart WHERE UserID = _UserID AND ProductID = _ProductID);
    CASE
	WHEN checkCount >= 1 THEN UPDATE cart SET Quantity = Quantity + 1 WHERE UserID = _UserID AND ProductID = _ProductID;
    UPDATE cart INNER JOIN product on product.ProductID = cart.ProductID SET cart.Total = product.Price * cart.Quantity where cart.UserID = _UserID AND cart.ProductID = _ProductID;
	ELSE INSERT INTO cart (UserID, ProductID, Quantity, Total) values (_UserID, _ProductID, 1, 0);
    UPDATE cart INNER JOIN product on product.ProductID = cart.ProductID SET cart.Total = product.Price * cart.Quantity where cart.UserID = _UserID AND cart.ProductID = _ProductID;
    end case;
END$$
DELIMITER ;