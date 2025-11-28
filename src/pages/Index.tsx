import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

type Step = 'tariff' | 'upload' | 'waiting' | 'complete';

const Index = () => {
  const [step, setStep] = useState<Step>('tariff');
  const [selectedTariff, setSelectedTariff] = useState<number | null>(null);
  const [username, setUsername] = useState('');
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const { toast } = useToast();

  const tariffs = [
    { id: 1, friends: '15-20', stars: 15, emoji: '✨', gradient: 'from-blue-400 to-blue-600' },
    { id: 2, friends: '21-29', stars: 25, emoji: '💫', gradient: 'from-purple-400 to-purple-600' },
    { id: 3, friends: '31-40', stars: 50, emoji: '🌟', gradient: 'from-yellow-400 to-orange-500' }
  ];

  const handleTariffSelect = (tariffId: number) => {
    setSelectedTariff(tariffId);
    setStep('upload');
    toast({
      title: "Тариф выбран! 🎉",
      description: "Теперь загрузите скриншоты",
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setScreenshots(Array.from(e.target.files));
    }
  };

  const handleSubmit = async () => {
    if (screenshots.length === 0 || !username) {
      toast({
        title: "Ошибка ⚠️",
        description: "Заполните все поля",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('https://functions.poehali.dev/8e680639-d064-40ac-bf8b-7d2721e5100c', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tariff_id: selectedTariff,
          username: username,
          telegram_user_id: Date.now()
        })
      });

      const data = await response.json();

      if (data.success) {
        setStep('waiting');
        toast({
          title: "Заявка отправлена! 🚀",
          description: "Ожидайте 3 дня для проверки",
        });
      } else {
        toast({
          title: "Ошибка ⚠️",
          description: "Не удалось отправить заявку",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка ⚠️",
        description: "Проблема с подключением",
        variant: "destructive"
      });
    }
  };

  const selectedTariffData = tariffs.find(t => t.id === selectedTariff);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            🤝 Реферальная программа
          </h1>
          <p className="text-lg text-muted-foreground">
            Приглашай друзей и получай звёзды Telegram
          </p>
        </div>

        {step === 'tariff' && (
          <div className="space-y-6 animate-scale-in">
            <Card className="p-6 bg-white/80 backdrop-blur border-2">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Icon name="Gift" size={28} className="text-purple-600" />
                Выберите тариф
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                {tariffs.map((tariff) => (
                  <Card 
                    key={tariff.id}
                    className={`p-6 cursor-pointer transition-all hover:scale-105 hover:shadow-xl bg-gradient-to-br ${tariff.gradient} text-white border-0`}
                    onClick={() => handleTariffSelect(tariff.id)}
                  >
                    <div className="text-center">
                      <div className="text-6xl mb-3">{tariff.emoji}</div>
                      <div className="text-3xl font-bold mb-2">{tariff.stars} ⭐</div>
                      <div className="text-lg font-semibold mb-1">Пригласи друзей</div>
                      <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                        {tariff.friends} человек
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <Icon name="Info" size={24} className="text-blue-600" />
                Условия программы
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-lg">📸</span>
                  <span>Приглашаете друзей согласно выбранному тарифу</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg">✅</span>
                  <span>Отправляете скриншоты подтверждения (добавление + активность)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg">⏰</span>
                  <span>Ждёте 3 дня для проверки (друзья не должны отписываться)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg">🎁</span>
                  <span>Получаете звёзды Telegram на ваш аккаунт</span>
                </li>
              </ul>
            </Card>
          </div>
        )}

        {step === 'upload' && (
          <div className="space-y-6 animate-fade-in">
            <Card className="p-6 bg-white/80 backdrop-blur border-2">
              <Button 
                variant="ghost" 
                onClick={() => setStep('tariff')}
                className="mb-4"
              >
                <Icon name="ArrowLeft" size={20} />
                Назад
              </Button>
              
              <div className="text-center mb-6">
                <div className="text-6xl mb-3">{selectedTariffData?.emoji}</div>
                <h2 className="text-2xl font-bold">
                  Выбран тариф: {selectedTariffData?.stars} ⭐
                </h2>
                <p className="text-muted-foreground">
                  Пригласите {selectedTariffData?.friends} друзей
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="screenshots" className="text-lg font-semibold flex items-center gap-2 mb-3">
                    <Icon name="Upload" size={24} className="text-blue-600" />
                    Загрузите скриншоты
                  </Label>
                  <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center hover:border-primary/60 transition-colors">
                    <input
                      id="screenshots"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="screenshots" className="cursor-pointer">
                      <Icon name="ImagePlus" size={48} className="mx-auto mb-3 text-primary/60" />
                      <p className="text-sm text-muted-foreground">
                        Нажмите для выбора файлов
                      </p>
                    </label>
                  </div>
                  {screenshots.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {screenshots.map((file, idx) => (
                        <Badge key={idx} className="bg-green-100 text-green-800">
                          <Icon name="Check" size={14} className="mr-1" />
                          {file.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="username" className="text-lg font-semibold flex items-center gap-2 mb-3">
                    <Icon name="User" size={24} className="text-purple-600" />
                    Ваш Telegram username
                  </Label>
                  <Input
                    id="username"
                    placeholder="@username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="text-lg h-12"
                  />
                </div>

                <Button 
                  onClick={handleSubmit}
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  size="lg"
                >
                  <Icon name="Send" size={24} className="mr-2" />
                  Отправить заявку
                </Button>
              </div>
            </Card>
          </div>
        )}

        {step === 'waiting' && (
          <Card className="p-8 bg-white/80 backdrop-blur border-2 text-center animate-scale-in">
            <div className="text-8xl mb-6">⏳</div>
            <h2 className="text-3xl font-bold mb-4">Заявка принята!</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Ваша заявка отправлена на проверку
            </p>
            
            <Card className="p-6 bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 mb-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Icon name="Clock" size={32} className="text-orange-600" />
                <div className="text-4xl font-bold text-orange-600">3 дня</div>
              </div>
              <p className="text-sm text-muted-foreground">
                Время ожидания для проверки активности друзей
              </p>
            </Card>

            <div className="space-y-3 text-sm text-left max-w-md mx-auto">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Icon name="CheckCircle2" size={18} className="text-blue-600" />
                </div>
                <p>Убедитесь, что друзья активны в течение 3 дней</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Icon name="CheckCircle2" size={18} className="text-purple-600" />
                </div>
                <p>Друзья не должны отписываться</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Icon name="CheckCircle2" size={18} className="text-green-600" />
                </div>
                <p>После проверки звёзды поступят на ваш аккаунт</p>
              </div>
            </div>

            <Button 
              onClick={() => {
                setStep('tariff');
                setSelectedTariff(null);
                setUsername('');
                setScreenshots([]);
              }}
              variant="outline"
              className="mt-8"
            >
              Создать новую заявку
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;