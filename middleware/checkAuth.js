import jwt from "jsonwebtoken";

export default (req, res, next) => {
    
    const token = (req.headers.authorization || '').replace(/Bearer\s?/, '');//если прищёл токен или не прищёл, всё равно передавай мне строчку

    if (token) {
        try {
            const decoded = jwt.verify(token, 'secret123');//расшифровали токен

            req.userId = decoded._id;//сохранил его в req.user.id
            next();//можно выполнять следующую функцию
        } catch (err) {
            return res.status(403).json({
                message: 'Not authorized"'
            });
        }
    } else {
        return res.status(403).json({
            message: 'Not authorized"'
        });
    }
}
//функция middleware посредник, и она решает, можжно ли возращять какуе-то информаци.