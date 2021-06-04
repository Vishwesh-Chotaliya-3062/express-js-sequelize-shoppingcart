DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `AddWallet`(IN `_UserID` INT(11), IN `_Amount` INT(10))
BEGIN
    UPDATE wallet SET Balance = Balance + _Amount WHERE UserID = _UserID;
END$$
DELIMITER ;