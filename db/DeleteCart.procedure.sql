DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `DeleteCart`(IN `_UserID` INT(11), IN `_ProductID` INT(11))
BEGIN
	
	DELETE FROM cart WHERE UserID = _UserID AND ProductID = _ProductID;
   
END$$
DELIMITER ;